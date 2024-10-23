import { ShaderMaterial, Texture, Vector2, Vector3 } from 'three';
import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { OPTS } from '../constant';

import baseVertex from '../glsl/base.vert';
import displayFrag from '../glsl/displayFrag.glsl'
import clearFrag from '../glsl/clear.frag';
import curlFrag from '../glsl/curl.frag';
import divergenceFrag from '../glsl/divergence.frag';
import gradientSubstractFrag from '../glsl/gradientSubstract.frag';
import pressureFrag from '../glsl/pressure.frag';
import splatFrag from '../glsl/splat.frag';
import advectionFrag from '../glsl/advection.frag';
import vorticityFrag from '../glsl/vorticity.frag';
import bloomPrefilterFrag from '../glsl/bloomPrefilter.frag';
import bloomBlurFrag from '../glsl/bloomBlur.frag';
import bloomFinalFrag from '../glsl/bloomFinal.frag';
import sunraysMaskFrag from '../glsl/sunraysMask.frag';
import sunraysFrag from '../glsl/sunrays.frag';

export const useMaterials = (): { [key: string]: ShaderMaterial } => {
    const size = useThree((s) => s.size);

    const shaderMaterials = useMemo(() => {
        const advection = new ShaderMaterial({
            uniforms: {
                uVelocity: {
                    value: new Texture(),
                },
                uSource: {
                    value: new Texture(),
                },
                dt: {
                    value: 0.016,
                },
                uDissipation: {
                    value: 1.0,
                },
                texelSize: { value: new Vector2() },
            },
            fragmentShader: advectionFrag,
        });

        const clear = new ShaderMaterial({
            uniforms: {
                uTexture: {
                    value: new Texture(),
                },
                uClearValue: {
                    value: OPTS.pressure,
                },
                texelSize: {
                    value: new Vector2(),
                },
            },
            fragmentShader: clearFrag,
        });

        const curl = new ShaderMaterial({
            uniforms: {
                uVelocity: {
                    value: new Texture(),
                },
                texelSize: {
                    value: new Vector2(),
                },
            },
            fragmentShader: curlFrag,
        });

        const divergence = new ShaderMaterial({
            uniforms: {
                uVelocity: {
                    value: new Texture(),
                },
                texelSize: {
                    value: new Vector2(),
                },
            },
            fragmentShader: divergenceFrag,
        });

        const display = new ShaderMaterial({
            uniforms: {
              uTexture: { value: new Texture() },
              uBloomTexture: { value: new Texture() },
              uSunraysTexture: { value: new Texture() },
              bloomIntensity: { value: 1.0 },    // Adjust as needed
              sunraysIntensity: { value: 1.0 },  // Adjust as needed
            },
            fragmentShader: displayFrag,
          });
          

          const bloomFinal = new ShaderMaterial({
            uniforms: {
              uBaseTexture: { value: null },
              uBloomTexture: { value: null },
              intensity: { value: 1.0 }, // Adjust as needed
            },
            fragmentShader: bloomFinalFrag,
          });


        // Inside your useMemo in useMaterials
        const bloomPrefilter = new ShaderMaterial({
            uniforms: {
            uTexture: { value: null },
            threshold: { value: 0.6 }, // Adjust as needed
            },
            fragmentShader: bloomPrefilterFrag,
        });
        
        const bloomBlur = new ShaderMaterial({
            uniforms: {
            uTexture: { value: null },
            texelSize: { value: new Vector2() },
            },
            fragmentShader: bloomBlurFrag,
        });
        
        const sunraysMask = new ShaderMaterial({
            uniforms: {
            uTexture: { value: null },
            },
            fragmentShader: sunraysMaskFrag,
        });
        
        const sunrays = new ShaderMaterial({
            uniforms: {
              uTexture: { value: null },
              sunPosition: { value: new Vector2(0.5, 0.5) }, // Adjust as needed
              weight: { value: 1.0 },
              decay: { value: 0.95 },
              exposure: { value: 0.3 },
            },
            fragmentShader: sunraysFrag,
          });
          
          

        const gradientSubstract = new ShaderMaterial({
            uniforms: {
                uPressure: {
                    value: new Texture(),
                },
                uVelocity: {
                    value: new Texture(),
                },
                texelSize: {
                    value: new Vector2(),
                },
            },
            fragmentShader: gradientSubstractFrag,
        });

        const pressure = new ShaderMaterial({
            uniforms: {
                uPressure: {
                    value: new Texture(),
                },
                uDivergence: {
                    value: new Texture(),
                },
                texelSize: {
                    value: new Vector2(),
                },
            },
            fragmentShader: pressureFrag,
        });

        const splat = new ShaderMaterial({
            uniforms: {
                uTarget: {
                    value: new Texture(),
                },
                aspectRatio: {
                    value: size.width / size.height,
                },
                uColor: {
                    value: new Vector3(),
                },
                uPointer: {
                    value: new Vector2(),
                },
                uRadius: {
                    value: OPTS.radius / 100.0,
                },
                texelSize: {
                    value: new Vector2(),
                },
            },
            fragmentShader: splatFrag,
        });

        const vorticity = new ShaderMaterial({
            uniforms: {
                uVelocity: {
                    value: new Texture(),
                },
                uCurl: {
                    value: new Texture(),
                },
                uCurlValue: {
                    value: OPTS.curl,
                },
                dt: {
                    value: 0.016,
                },
                texelSize: {
                    value: new Vector2(),
                },
            },
            fragmentShader: vorticityFrag,
        });

        return {
            splat,
            display,
            curl,
            bloomPrefilter,
            bloomBlur,
            sunraysMask,
            sunrays,
            bloomFinal,
            clear,
            divergence,
            pressure,
            gradientSubstract,
            advection,
            vorticity,
        };
    }, [size]);

    useEffect(() => {
        const aspectRatio = size.width / size.height;
      
        for (const [key, material] of Object.entries(shaderMaterials)) {
          // Set texelSize for materials that have it
          if (material.uniforms.texelSize) {
            if (key === 'bloomBlur') {
              // For bloomBlur, use full resolution
              material.uniforms.texelSize.value.set(
                1 / size.width,
                1 / size.height
              );
            } else {
              // For other materials, use simulation resolution
              material.uniforms.texelSize.value.set(
                1 / (OPTS.simRes * aspectRatio),
                1 / OPTS.simRes
              );
            }
          }
      
          // Set aspectRatio for materials that have it
          if (material.uniforms.aspectRatio) {
            material.uniforms.aspectRatio.value = aspectRatio;
          }
      
          material.vertexShader = baseVertex;
          material.depthTest = false;
          material.depthWrite = false;
        }
      
        return () => {
          for (const material of Object.values(shaderMaterials)) {
            material.dispose();
          }
        };
      }, [shaderMaterials, size]);
      
    

    return shaderMaterials;
};
