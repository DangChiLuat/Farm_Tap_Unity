using UnityEngine;

interface ICharacterState 
{
    void Enter(CharactorController controller);
    void Update(CharactorController controller);
    void Exit(CharactorController controller);
}
