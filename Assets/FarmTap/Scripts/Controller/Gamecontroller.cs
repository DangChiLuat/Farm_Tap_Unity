using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;
using System.Collections.Generic;

public class Gamecontroller : MonoBehaviour
{
    public static Gamecontroller Instance { get; private set; }

    [Header("Effect Settings")]
    [SerializeField] private GameObject effectHit;
    private int POOL_SIZE = 5;


    [Header("Settings")]
    [SerializeField] private bool isVideo = false;
    [SerializeField] private bool isCam = true;
    [SerializeField] private bool isCanInteract = true;

    [Header("Character Lists")]
    [SerializeField] private List<GameObject> listCharacter = new List<GameObject>();

    // Public properties
    public bool IsStartGame { get; set; } = false;
    public List<GameObject> MovableCharacters { get; private set; } = new List<GameObject>();
    public int TotalCharacterCount { get; private set; } = 0;
    public int CountMove { get; set; } = 0;
    public bool IsEndGame { get; set; } = false;
    public bool IsCanTouch { get; set; } = false;
    public int Coin { get; private set; } = -5;
    public bool StartCountTime { get; set; } = false;

    // Private variables
    private List<GameObject> effectPool = new List<GameObject>();

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }
    void OnEnable()
    {
        InitializeEffectPools();
    }


    private void InitializeEffectPools()
    {
        if (effectHit == null) return;

        for (int i = 0; i < POOL_SIZE; i++)
        {
            GameObject effect = Instantiate(effectHit, transform);
            effect.SetActive(false);
            effectPool.Add(effect);
        }
    }

    private GameObject GetAvailableEffect()
    {
        foreach (GameObject effect in effectPool)
        {
            if (!effect.activeSelf)
            {
                return effect;
            }
        }
        return null;
    }

    private GameObject GetGlowFromEffect(GameObject effect)
    {
        if (effect == null) return null;

        foreach (Transform child in effect.transform)
        {
            if (child.name.ToLower().Contains("glow") ||
                child.GetComponent<ParticleSystem>() != null)
            {
                return child.gameObject;
            }
        }
        return null;
    }

    private void ResetEffect(GameObject effect)
    {
        if (effect == null) return;

        ParticleSystem particleSystem = effect.GetComponent<ParticleSystem>();
        if (particleSystem != null)
        {
            particleSystem.Stop();
            particleSystem.Clear();
        }
    }

    public void PlayEffect(GameObject position)
    {
        GameObject effect = GetAvailableEffect();
        if (effect == null) return;

        GameObject glow = GetGlowFromEffect(effect);

        ResetEffect(effect);
        if (glow != null) ResetEffect(glow);

        effect.SetActive(true);

        Vector3 pos = position.transform.position;
        effect.transform.position = new Vector3(pos.x, pos.y, pos.z);

        ParticleSystem particleSystem = effect.GetComponent<ParticleSystem>();
        ParticleSystem particleGlow = glow != null ? glow.GetComponent<ParticleSystem>() : null;

        if (particleSystem != null) particleSystem.Play();
        if (particleGlow != null) particleGlow.Play();

        StartCoroutine(DeactivateEffectAfterDelay(effect, 0.2f));
    }

    private IEnumerator DeactivateEffectAfterDelay(GameObject effect, float delay)
    {
        yield return new WaitForSeconds(delay);
        effect.SetActive(false);
    }

}
