using UnityEngine;
using UnityEngine.InputSystem.XR;

public class AnimationController : MonoBehaviour
{
    public void animImpactDone()
    {
        CharactorController controller = gameObject.GetComponentInParent<CharactorController>();
        Debug.Log("Impact animation done");
        controller.ChangeState(CharacterStateType.Idle);
    }
}
