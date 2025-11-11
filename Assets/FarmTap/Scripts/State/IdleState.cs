using UnityEngine;

public class IdleState : ICharacterState
{
    public void Enter(CharactorController controller)
    {
        Debug.Log("Enter Idle State");

        if (controller.DustEffect != null)
        {
            controller.DustEffect.Stop();
            controller.dustEffect.gameObject.SetActive(false);
        }
       
    }

    public void Exit(CharactorController controller)
    {
        Debug.Log("Exit Idle State");
    }

    public void Update(CharactorController controller)
    {
        // Idle state logic here if needed
    }
}