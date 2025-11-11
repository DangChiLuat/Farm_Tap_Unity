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
        transform.DOMoveX(5, 2).SetLoops(-1, LoopType.Yoyo);
    }
}
