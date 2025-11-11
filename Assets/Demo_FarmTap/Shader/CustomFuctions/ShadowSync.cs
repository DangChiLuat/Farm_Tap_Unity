using System.Collections;
using System.Collections.Generic;
using UnityEditor.Rendering.Universal;
using UnityEngine;

[ExecuteInEditMode]
public class ShadowSync : MonoBehaviour
{
    public Camera shadowCamera;
    public Material shadowMaterial;
    void Update()
    {
        var vp = shadowCamera.projectionMatrix * shadowCamera.worldToCameraMatrix;
        shadowMaterial.SetMatrix("_ShadowVP", vp);
    }
}
