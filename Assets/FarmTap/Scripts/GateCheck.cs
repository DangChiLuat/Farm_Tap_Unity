using DG.Tweening;
using UnityEngine;

public class GateCheck : MonoBehaviour
{

    private void OnTriggerEnter(Collider other)
    {
        Debug.Log("check");
        moveToEndPos(other.transform);
        other.enabled = false;
    }
    public void moveToEndPos(Transform obj)
    {
        obj.DOLocalRotate(new Vector3(0, -180, 0), 0.1f, RotateMode.Fast);
        obj.DOLocalMoveZ(-10,10);
    }
}
