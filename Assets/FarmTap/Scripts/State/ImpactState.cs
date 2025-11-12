using UnityEngine;

public class ImpactState : ICharacterState
{
    private float impactDuration = 0.3f;
    private float impactTimer = 0f;

    public void Enter(CharactorController controller)
    {
        Debug.Log("Enter Impact State");
        impactTimer = 0f;
        Gamecontroller.Instance.PlayEffect(controller.posEffect);
        controller.dustEffect.gameObject.SetActive(true);
        controller.dustEffect.Play();
       // SoundManager.instance.PlaySound(2);

    }

    public void Exit(CharactorController controller)
    {
        Debug.Log("Exit Impact State");
    }

    public void Update(CharactorController controller)
    {
        impactTimer += controller.GetDeltaTime();

        // Move back to safe position during impact
        Vector3 current = controller.transform.position;
        Vector3 targetSafePos = controller.SafePos;

        targetSafePos.y = current.y; 


        Vector3 dir = targetSafePos - current;
        float dist = dir.magnitude;

        if (dist < 0.5f)
        {
            Vector3 finalPos = controller.SafePos;
            finalPos.y = current.y;
            controller.transform.position = finalPos;

            // Transition back to Idle after impact duration
            if (impactTimer >= impactDuration)
            {
           //     controller.ChangeState(CharacterStateType.Idle);
            }
            return;
        }

        dir.Normalize();
        float moveAmount = controller.GetDeltaTime() * dist * 10f;
        Vector3 moveVec = dir * moveAmount;

        moveVec.y = 0;
        controller.transform.position = controller.transform.position + moveVec;
    }
}