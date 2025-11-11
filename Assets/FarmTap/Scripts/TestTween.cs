using DG.Tweening;
using UnityEngine;

public class TestTween : MonoBehaviour
{
    private void Start()
    {
        startTween();
    }
    public void startTween()
    {
        transform.DOMove(new Vector3(1, 2, 3), 1);
    }
}
