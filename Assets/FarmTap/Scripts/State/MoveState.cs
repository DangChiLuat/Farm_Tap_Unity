using UnityEngine;

public class MoveState : ICharacterState
{
    private float currentSpeed = 0f;
    private float accelerationTime = 0f;
    private float maxAccelerationTime = 0.2f;

    public void Enter(CharactorController controller)
    {
        Debug.Log("Enter Move State");
        controller.trails.SetActive(true);
        if (controller.DustEffect != null)
        {
            controller.DustEffect.Play();
        }

        if (!controller.IsHaveBox)
        {
            if (!controller.IsHaveBox || controller.TargetDistance > 1.1f)
            {
                // SoundManager.Instance.PlaySound("runing");
            }
        }

        currentSpeed = 0f;
        accelerationTime = 0f;
    }

    public void Exit(CharactorController controller)
    {
        Debug.Log("Exit Move State");

        controller.trails.SetActive(false);
        if (controller.IsChar)
        {
            if (controller.DustEffect != null)
            {
                controller.DustEffect.Stop();
            }
            controller.IsChar = false;
        }
    }

    public void Update(CharactorController controller)
    {
        // Calculate acceleration
        accelerationTime += controller.GetDeltaTime();
        float accelerationRatio = Mathf.Min(accelerationTime / maxAccelerationTime, 1.0f);

        // Use easing function for smoother movement
        float easedRatio = EaseInQuad(accelerationRatio);
        currentSpeed = controller.GetMoveSpeed() * easedRatio;

        float remaining = controller.TargetDistance - controller.DistanceMoved;
        float moveAmount = Mathf.Min(currentSpeed * controller.GetDeltaTime(), remaining);

        Vector3 moveVec = controller.MoveDirection * moveAmount;
        controller.transform.position = controller.transform.position + moveVec;
        controller.DistanceMoved += moveAmount;

        if (controller.DistanceMoved >= controller.TargetDistance)
        {
            controller.ChangeState(CharacterStateType.Impact);

            if (controller.NodeClosest != null)
            {
                controller.GetClosestNode(controller.NodeClosest);
            }
        }
    }

    private float EaseInQuad(float t)
    {
        return t * t;
    }
}