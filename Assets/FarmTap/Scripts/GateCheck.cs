using DG.Tweening;
using UnityEngine;
using UnityEngine.TextCore.Text;

public class GateCheck : MonoBehaviour
{
    [SerializeField] private Transform[] wayPoints;

    private void OnTriggerEnter(Collider other)
    {
        Debug.Log("check");
        // moveToEndPos(other.transform);
        other.enabled = false;
    }

    public void moveCharToTarget(Transform character)
    {
        
        Vector3[] movePoints = new Vector3[wayPoints.Length + 1];
        movePoints[0] = character.position;
        for (int i = 0; i < wayPoints.Length; i++)
        {
            movePoints[i + 1] = wayPoints[i].position;
        }

        Sequence moveSequence = DOTween.Sequence();

        for (int i = 0; i < movePoints.Length - 1; i++)
        {
            Vector3 startPos = movePoints[i];
            Vector3 endPos = movePoints[i + 1];
            float distance = Vector3.Distance(startPos, endPos);
            float moveTime = distance / 6;

            // Calculate direction and target Y angle
            Vector3 dir = endPos - startPos;
            dir.y = 0;
            float targetAngle = Mathf.Atan2(dir.x, dir.z) * Mathf.Rad2Deg;

            moveSequence.AppendCallback(() => 
            {
                float currentAngle = character.eulerAngles.y;
                float deltaAngle = Mathf.DeltaAngle(currentAngle, targetAngle);

                character.DORotate(new Vector3(0, currentAngle + deltaAngle, 0), 0.1f).SetEase(Ease.Flash);
            });

            moveSequence.Append(character.DOMove(endPos, moveTime).SetEase(Ease.Linear));
        }

        moveSequence.AppendCallback(() =>
        {
            Destroy(character.gameObject);
        });

        moveSequence.Play(); 
    }
}
