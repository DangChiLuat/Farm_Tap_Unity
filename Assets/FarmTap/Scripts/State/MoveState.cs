using DG.Tweening;
using UnityEngine;

public class MoveState : ICharacterState
{
    private float currentSpeed = 0f;
    private float accelerationTime = 0f;
    private float maxAccelerationTime = 0.2f;

    public bool finishMove = false;
    public void Enter(CharactorController controller)
    {
        Debug.Log("Enter Move State");
        controller.trails.gameObject.SetActive(true);
        controller.trails.Play();
        //if (controller.DustEffect != null)
        //{
        //    controller.DustEffect.Play();
        //}

        if (!controller.IsHaveBox)
        {
            SoundManager.instance.PlaySound(1);
            if (!controller.IsHaveBox || controller.TargetDistance > 1.1f)
            {
                 SoundManager.instance.PlaySound(3);
            }
        }

        currentSpeed = 0f;
        accelerationTime = 0f;
    }

    public void Exit(CharactorController controller)
    {
        Debug.Log("Exit Move State");
        controller.trails.gameObject.SetActive(false);
        controller.trails.Stop();
        // controller.trails.SetActive(false);
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
        if(this.finishMove) return;
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
            if (controller.IsHitGateCheck)
            {  
                //controller.ChangeState(CharacterStateType.Idle);
                controller.gate.moveCharToTarget(controller.transform);
               // controller.ChangeState(CharacterStateType.Run);
                this.finishMove = true;
            }

            else if (controller.NodeClosest != null)
            {
                controller.GetClosestNode(controller.NodeClosest);
                controller.ChangeState(CharacterStateType.Impact);
            }
        }
    }

    private float EaseInQuad(float t)
    {
        return t * t;
    }
}