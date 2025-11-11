using DG.Tweening;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CharactorController : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private Transform startNode;
    [SerializeField] private GameObject player;
    [SerializeField] public GameObject posEffect;
    [SerializeField] public GameObject trails;
    [SerializeField] private ParticleSystem smokeEffect;
    [SerializeField] public ParticleSystem dustEffect;

    [Header("Movement Settings")]
    [SerializeField] private float moveSpeed = 10f;
    [SerializeField] private float safeDistance = 1.0f;

    [Header("Character Type")]
    [SerializeField] private bool isSheep = false;
    [SerializeField] private bool isCow = false;
    [SerializeField] private bool isPig = false;
    [SerializeField] public bool isOneWay = false;

    // Public properties
    public ParticleSystem DustEffect => dustEffect;

    // State management
    private ICharacterState _currentState;
    private CharacterStateType _currentStateType;
    private Dictionary<CharacterStateType, ICharacterState> _states;

    // Movement variables
    public bool IsMoving { get; set; }
    public Vector3 MoveDirection { get; private set; }
    public Vector3 StartPosition { get; private set; }
    public float DistanceMoved { get; set; }
    public float TargetDistance { get; private set; }
    public float CheckDistance { get; private set; }

    // Position tracking
    public Vector3 SafePos { get; private set; }
    public Vector3 HitPos { get; private set; }
    public Vector3 CurrentPosBoom { get; private set; }

    // Flags
    private bool _isInImpact = false;
    public bool IsHaveBox { get; set; } = true;
    public bool IsSheepMove { get; set; } = false;
    public bool IsHitWayPoint { get; set; } = false;
    public bool IsHitGateCheck { get; set; } = false;
    public bool IsChar { get; set; } = false;
    public bool IsCanNotInteract { get; set; } = false;

    // Private variables
    private float maxScanDistance = 30f;
    private Animator _animator;
    public GameObject NodeClosest { get; private set; }
    private float _deltaTime;

    void Start()
    {
        _animator = player.GetComponent<Animator>();

        InitializeStates();
        SetPivotSmoke();
    }

    void Update()
    {
        _deltaTime = Time.deltaTime;

        if (_currentState != null)
        {
            _currentState.Update(this);
        }

        if (_currentStateType == CharacterStateType.Idle) return;
    }

    public float GetDeltaTime()
    {
        return _deltaTime;
    }
    public float GetMoveSpeed()
    {
        return moveSpeed;
    }

    private void SetPivotSmoke()
    {
        if (dustEffect == null) return;

        float angleParent = (transform.parent.eulerAngles.y + 360) % 360;
        float angle = (transform.eulerAngles.y + 360) % 360;

        float deg = (angle + angleParent - 90) * Mathf.Deg2Rad;
        var main = dustEffect.main;
        main.startRotation3D = true;
        main.startRotationX = 0;
        main.startRotationY = 0;
        main.startRotationZ = deg;
    }

    private void InitializeStates()
    {
        _states = new Dictionary<CharacterStateType, ICharacterState>();
        _states.Add(CharacterStateType.Idle, new IdleState());
        _states.Add(CharacterStateType.Run, new MoveState());
        _states.Add(CharacterStateType.Impact, new ImpactState());

        ChangeState(CharacterStateType.Idle);
    }

    public void ChangeState(CharacterStateType newStateType)
    {
        // Exit current state
        if (_currentState != null)
        {
            _currentState.Exit(this);
        }

        // Change to new state
        _currentStateType = newStateType;
        _currentState = _states[newStateType];

        // Update animator parameters
        UpdateAnimatorParameters(newStateType);

        // Enter new state
        _currentState.Enter(this);
    }

    private void UpdateAnimatorParameters(CharacterStateType stateType)
    {
        if (_animator == null) return;

        // Reset all animation parameters to false
        _animator.SetBool("Idle", false);
        _animator.SetBool("Run", false);
        _animator.SetBool("Impact", false);

        // Set the current state parameter to true
        switch (stateType)
        {
            case CharacterStateType.Idle:
                _animator.SetBool("Idle", true);
                _isInImpact = false;
                break;
            case CharacterStateType.Run:
                _animator.SetBool("Run", true);
                _isInImpact = false;
                break;
            case CharacterStateType.Impact:
                _animator.SetBool("Impact", true);
                _isInImpact = true;
                break;
        }
    }

    public CharacterStateType GetCurrentStateType()
    {
        return _currentStateType;
    }

    private float PerformSweepScan(Vector3 origin, Vector3 direction)
    {
        RaycastHit hit;
        int mask = unchecked((int)0xffffffff);

        bool hasHit = Physics.Raycast(origin, direction, out hit, maxScanDistance, mask);
        Debug.DrawRay(origin, direction * maxScanDistance, Color.red, 2.0f);
        if (!hasHit)
        {
            Debug.Log("No hit detected in PerformSweepScan.");
            IsHaveBox = false;
            IsSheepMove = true;

            BoxCollider boxCollider = GetComponent<BoxCollider>();
            if (boxCollider != null) Destroy(boxCollider);

            StartCoroutine(CheckAndDestroyIfOutOfViewportCoroutine(0.1f));
            return maxScanDistance;
        }
        else
        {
            Debug.Log("Hit detected in PerformSweepScan.");
            CheckDistance = hit.distance;
            float closestDistance = maxScanDistance;
            bool foundValidHit = false;

            NodeClosest = hit.collider.gameObject;

            CharactorController otherController = hit.collider.GetComponent<CharactorController>();
            GateCheck gateCheck = hit.collider.GetComponent<GateCheck>();
            if (otherController != null)
            {
                if (hit.distance < closestDistance)
                {
                    closestDistance = hit.distance;
                    foundValidHit = true;
                    IsChar = true;
                }
            }
            else if (gateCheck) 
            {
                Debug.Log("gateCheck");
                closestDistance = hit.distance;
                return closestDistance;
            }
            else
            {
                Collider collider = GetComponent<Collider>();
                if (collider != null) collider.enabled = false;

                if (hit.distance < closestDistance)
                {
                    closestDistance = hit.distance;
                    foundValidHit = true;

                    float destroyDelay = closestDistance / moveSpeed;
                    StartCoroutine(DestroyAfterDelay(destroyDelay));
                }
            }

            if (foundValidHit)
            {
                return Mathf.Max(0, closestDistance - safeDistance);
            }
        }

        return maxScanDistance;
    }

    private IEnumerator DestroyAfterDelay(float delay)
    {
        yield return new WaitForSeconds(delay);
        Destroy(gameObject);
    }

    public void SetupMovement(Vector3 origin, Vector3 direction)
    {
        IsHitWayPoint = false;
        MoveDirection = direction.normalized;

        float safeDistanceResult = PerformSweepScan(origin, MoveDirection);

        float hitDistance = (safeDistanceResult < maxScanDistance)
            ? safeDistanceResult + safeDistance
            : maxScanDistance;

        HitPos = origin + MoveDirection * hitDistance;
        SafePos = origin + MoveDirection * safeDistanceResult;

        StartPosition = origin;
        DistanceMoved = 0;
        TargetDistance = hitDistance - 0.5f;
    }

    public void GetClosestNode(GameObject nodeClose)
    {
        if (nodeClose == null || nodeClose.GetComponent<CharactorController>() == null) return;

        // Play sound based on character type
        if (isSheep)
        {
            // SoundManager.Instance.PlaySound("Sheepbaa");
        }
        else if (isCow)
        {
            // SoundManager.Instance.PlaySound("Uh_1");
        }
        else if (isPig)
        {
            // SoundManager.Instance.PlaySound("pig_va_cham");
        }

        Vector3 currentPosOther = nodeClose.transform.position;

        // Apply impact animation using DOTween or coroutines
       ApplyImpactAnimation(nodeClose);

        NodeClosest = nodeClose;
    }

    private void ApplyImpactAnimation(GameObject nodeClose)
    {
        Vector3 currentPosOther = nodeClose.transform.position;
        Vector3 offset = Vector3.zero;
        if(Mathf.Approximately(transform.eulerAngles.y , 0) || Mathf.Approximately(transform.eulerAngles.y, 180))
        {
            offset = new Vector3(0, 0, 0.2f);
        }
        else
        {
            offset = new Vector3(0.2f, 0, 0);   
        }

        float duration = 0.1f;
        nodeClose.transform.DOKill();
        Sequence seq = DOTween.Sequence();
        seq.Append(nodeClose.transform.DOMove(currentPosOther + offset, duration).SetEase(Ease.OutQuad));
        seq.Append(nodeClose.transform.DOMove(currentPosOther, duration).SetEase(Ease.InQuad));
    }

    public void OnClick()
    {
        if (_currentStateType != CharacterStateType.Idle)
        {
            return;
        }

        Vector3 direction = startNode.forward;
        Vector3 origin = startNode.position;

        SetupMovement(origin, direction);
        ChangeState(CharacterStateType.Run);
    }

    public void StopMovement()
    {
        IsMoving = false;
    }

    public bool CheckMove()
    {
        Vector3 origin = startNode.position;
        Vector3 direction = -startNode.forward;
        direction.Normalize();

        RaycastHit[] hits = Physics.RaycastAll(origin, direction, maxScanDistance);

        if (hits.Length > 0)
        {
            foreach (RaycastHit hit in hits)
            {
                Rigidbody rb = hit.collider.GetComponent<Rigidbody>();
                if (rb != null)
                {
                    // Check if rigidbody is in layer 16 (equivalent to group 16)
                    if (hit.collider.gameObject.layer == 4)
                    {
                        float distance = hit.distance;
                        if (distance < 4)
                        {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        else
        {
            return true;
        }
    }

    public bool IsInImpact
    {
        get { return _isInImpact; }
    }

    private bool IsNodeOutOfViewport()
    {
        Camera mainCamera = Camera.main;
        if (mainCamera == null) return false;

        Vector3 viewportPos = mainCamera.WorldToViewportPoint(transform.position);
        float margin = -30f / Screen.width;

        return viewportPos.x < -margin ||
               viewportPos.x > 1 + margin ||
               viewportPos.y < -margin ||
               viewportPos.y > 1 + margin;
    }

    private IEnumerator CheckAndDestroyIfOutOfViewportCoroutine(float delay)
    {
        yield return new WaitForSeconds(delay);

        if (IsNodeOutOfViewport())
        {
            Destroy(gameObject);
        }
        else
        {
            StartCoroutine(CheckAndDestroyIfOutOfViewportCoroutine(0.1f));
        }
    }

    public bool CanMove()
    {
        if (gameObject == null) return false;

        Vector3 origin = startNode.position;
        Vector3 direction = -startNode.forward;
        direction.Normalize();

        RaycastHit hit;
        int mask = ~(1 << 4); // All layers except layer 4

        bool hasHit = Physics.Raycast(origin, direction, out hit, maxScanDistance, mask);

        if (!hasHit)
        {
            return true;
        }

        float currentDistance = hit.distance;
        return currentDistance >= safeDistance + 1;
    }
}