using UnityEngine;

public class HandleInputListener : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private Camera cameraCom;

    // Camera movement variables
    private Vector2 _lastTouchPosition = Vector2.zero;
    private bool _isDragging = false;
    private float _cameraSmoothing = 0.1f;
    private Vector3 _targetCameraPosition = Vector3.zero;

    // Touch timing variables
    private float _touchStartTime = 0f;
    private float _touchThreshold = 0.2f; // 0.2 seconds
    private bool _isTouchMoved = false;
    private bool isDone = false;
    private bool canInteract = true;

    private Ray _ray;

    void OnEnable()
    {
        if (cameraCom != null)
        {
            _targetCameraPosition = cameraCom.transform.position;
        }
    }

    void Update()
    {
        HandleInput();
       // SmoothCameraMovement();
    }

    private void HandleInput()
    {
        if (!canInteract) return;

        // Touch/Mouse input handling
        if (Input.touchCount > 0)
        {
            Touch touch = Input.GetTouch(0);

            switch (touch.phase)
            {
                case TouchPhase.Began:
                    OnTouchStart(touch.position);
                    break;
                case TouchPhase.Moved:
                    OnTouchMove(touch.position);
                    break;
                case TouchPhase.Ended:
                case TouchPhase.Canceled:
                    OnTouchEnd(touch.position);
                    break;
            }
        }
        else if (Input.GetMouseButtonDown(0))
        {
            OnTouchStart(Input.mousePosition);
        }
        else if (Input.GetMouseButton(0))
        {
            OnTouchMove(Input.mousePosition);
        }
        else if (Input.GetMouseButtonUp(0))
        {
            OnTouchEnd(Input.mousePosition);
        }
    }

    private void OnTouchStart(Vector2 position)
    {
        Debug.Log("OnTouchStart called");
        // SoundManager.Instance.PlayTheme();

        // Start timing and reset state
        _touchStartTime = Time.time;
        _isTouchMoved = false;

        // Initialize dragging state
        _isDragging = true;
        _lastTouchPosition = position;

        if (cameraCom != null)
        {
            _ray = cameraCom.ScreenPointToRay(position);
        }
    }

    private void OnTouchMove(Vector2 position)
    {
        // Uncomment if you want camera movement
        return;

        /*
        if (!Gamecontroller.Instance.IsCanTouch) return;

        if (_isDragging)
        {
            // Mark that touch has moved
            _isTouchMoved = true;

            // Calculate delta movement
            float deltaX = position.x - _lastTouchPosition.x;
            float deltaY = position.y - _lastTouchPosition.y;

            float worldDeltaX = -deltaX * _cameraMoveSpeed;
            float worldDeltaZ = deltaY * _cameraMoveSpeed;

            // Calculate new position
            float newTargetX = _targetCameraPosition.x + worldDeltaX;
            float newTargetZ = _targetCameraPosition.z + worldDeltaZ;

            // Clamp camera within allowed range
            float clampedX = 0;
            float clampedZ = 0;

            if (Gamecontroller.Instance.ResizeCam.IsLands)
            {
                clampedX = Mathf.Clamp(newTargetX, -10f, 7f);
                clampedZ = Mathf.Clamp(newTargetZ, -20f, 20f);
            }
            else
            {
                clampedX = Mathf.Clamp(newTargetX, -10f, 7f);
                clampedZ = Mathf.Clamp(newTargetZ, -10f, 10f);
            }

            _targetCameraPosition.x = clampedX;
            _targetCameraPosition.z = clampedZ;
        }

        _lastTouchPosition = position;
        */
    }

    private void OnTouchEnd(Vector2 position)
    {
        Debug.Log("OnTouchEnd called");
        if (Gamecontroller.Instance != null)
        {
            Gamecontroller.Instance.StartCountTime = true;
        }

        if (!_isDragging) return;

        float touchDuration = Time.time - _touchStartTime;

        if (cameraCom != null)
        {
            _ray = cameraCom.ScreenPointToRay(position);
        }

        // Raycast with layer mask (layer 1)
        int layerMask = 1 << 6;
        RaycastHit hit;

        if (Physics.Raycast(_ray, out hit, Mathf.Infinity,layerMask))
        {
            GameObject nodeOther = hit.collider.gameObject; 
            CharactorController item = nodeOther.GetComponent<CharactorController>();
            if (item != null &&
                item.GetCurrentStateType() == CharacterStateType.Idle &&
                touchDuration < _touchThreshold &&
                !_isTouchMoved)
            {
                SoundManager.instance.PlaySound(0);
                item.OnClick();
            }
        }
        _isDragging = false;
    }

    private void SmoothCameraMovement()
    {
        if (cameraCom == null) return;

        Vector3 currentPos = cameraCom.transform.position;
        Vector3 newPos = Vector3.Lerp(currentPos, _targetCameraPosition, _cameraSmoothing);
        newPos.y = currentPos.y;

        if (Gamecontroller.Instance != null && Gamecontroller.Instance.IsStartGame)
        {
            cameraCom.transform.position = newPos;
        }
    }
}