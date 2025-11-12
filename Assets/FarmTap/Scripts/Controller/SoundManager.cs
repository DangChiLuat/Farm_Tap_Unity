using UnityEngine;

public class SoundManager : MonoBehaviour
{
    public static SoundManager instance { get; private set; }

    [SerializeField] private AudioClip[] musicSource; // Array containing MP3 audio files
    [SerializeField] private AudioSource audioSource; // AudioSource component to play sounds

    private void Awake()
    {
        // Ensure only one instance exists
        if (instance == null)
        {
            instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }
    public void PlaySound(int index)
    {
        if (musicSource == null || musicSource.Length == 0)
        {
            Debug.LogWarning("SoundManager: musicSource array is empty!");
            return;
        }

        if (index < 0 || index >= musicSource.Length)
        {
            Debug.LogWarning($"SoundManager: Invalid sound index {index}. Array length is {musicSource.Length}");
            return;
        }

        if (musicSource[index] == null)
        {
            Debug.LogWarning($"SoundManager: AudioClip at index {index} is null!");
            return;
        }

        audioSource.PlayOneShot(musicSource[index]);
    }
    public void PlaySound(string soundName)
    {
        if (musicSource == null || musicSource.Length == 0)
        {
            Debug.LogWarning("SoundManager: musicSource array is empty!");
            return;
        }

        AudioClip clip = System.Array.Find(musicSource, sound => sound != null && sound.name == soundName);

        if (clip == null)
        {
            Debug.LogWarning($"SoundManager: Sound '{soundName}' not found in musicSource array!");
            return;
        }

        audioSource.PlayOneShot(clip);
    }

    public void StopSound()
    {
        if (audioSource != null)
        {
            audioSource.Stop();
        }
    }
    public void SetVolume(float volume)
    {
        if (audioSource != null)
        {
            audioSource.volume = Mathf.Clamp01(volume);
        }
    }
}