import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { useCallback, useMemo, useRef } from 'react';
import { Color, Mesh, Texture, Vector2, Vector3 } from 'three';

// import { ShaderPass } from 'three/examples/jsm/Addons.js';
// import { Effect as FluidEffect } from './effect/Fluid';
import { useFBOs } from './hooks/useFBOs';
import { useMaterials } from './hooks/useMaterials';
import { Props } from './types';
import { OPTS } from './constant';
import { usePointer } from './hooks/usePointer';
type Uniforms = {
    uColor: Vector3 | Color;
    uPointer: Vector2;
    uTarget: Texture | null;
    uVelocity: Texture;
    uCurl: Texture;
    uTexture: Texture;
    uPressure: Texture;
    uDivergence: Texture;
    uSource: Texture;
    uRadius: number;
    uClearValue: number;
    uCurlValue: number;
    uDissipation: number;
    // Add missing uniforms
    uBloom: Texture;
    uSunrays: Texture;
    intensity: number;
    threshold: number;
    weight: number;
    decay: number;
    exposure: number;
    texelSize: Vector2;
    dt: number;
    aspectRatio: number;
  };

const bloomThreshold = 1.0;
const bloomIntensity = 0.2;
const sunraysWeight = 1.0;
const sunraysDecay = 0.5;
const sunraysExposure = 0.1;

function HSVtoRGB(h, s, v) {
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
  
    switch (i % 6) {
      case 0:
        r = v; g = t; b = p;
        break;
      case 1:
        r = q; g = v; b = p;
        break;
      case 2:
        r = p; g = v; b = t;
        break;
      case 3:
        r = p; g = q; b = v;
        break;
      case 4:
        r = t; g = p; b = v;
        break;
      case 5:
        r = v; g = p; b = q;
        break;
    }
  
    return { r, g, b };
  }  
  

export const Fluid = ({
    blend = OPTS.blend,
    force = OPTS.force,
    radius = OPTS.radius,
    curl = OPTS.curl,
    swirl = OPTS.swirl,
    intensity = OPTS.intensity,
    distortion = OPTS.distortion,
    fluidColor = OPTS.fluidColor,
    backgroundColor = OPTS.backgroundColor,
    showBackground = OPTS.showBackground,
    rainbow = OPTS.rainbow,
    pressure = OPTS.pressure,
    densityDissipation = OPTS.densityDissipation,
    velocityDissipation = OPTS.velocityDissipation,
}: Props) => {
    const size = useThree((three) => three.size);
    const gl = useThree((three) => three.gl);
    const {scene, camera } = useThree();

    const meshRef = useRef<Mesh>(null);
    // const postRef = useRef<ShaderPass>(null);

    const FBOs = useFBOs();
    const materials = useMaterials();
    const { onPointerMove, splatStack } = usePointer({ force: 1 });

    const setShaderMaterial = useCallback(
        (name: keyof ReturnType<typeof useMaterials>) => {
            if (!meshRef.current) return;

            meshRef.current.material = materials[name];
            meshRef.current.material.needsUpdate = true;
        },
        [materials],
    );

    const setRenderTarget = useCallback(
    (name: keyof ReturnType<typeof useFBOs>) => {
        const target = FBOs[name];

        if (!meshRef.current) return;

        if ('write' in target) {
            gl.setRenderTarget(target.write);
            gl.clear();
            gl.render(meshRef.current, camera);
            target.swap();
        } else {
            gl.setRenderTarget(target);
            gl.clear();
            gl.render(meshRef.current, camera);
        }
    },
    [FBOs, gl, meshRef, camera],
    );


    const setUniforms = useCallback(
        <K extends keyof Uniforms>(
            material: keyof ReturnType<typeof useMaterials>,
            uniform: K,
            value: Uniforms[K],
        ) => {
            const mat = materials[material];

            if (mat && mat.uniforms[uniform]) {
                mat.uniforms[uniform].value = value;
            }
        },
        [materials],
    );

    useFrame(({ gl }) => {
        if (!meshRef.current) return;

        let lastMouseX = 0;
        let lastMouseY = 0;

        // Inside your useFrame or splat handling function
        for (let i = splatStack.length - 1; i >= 0; i--) {
          const { mouseX, mouseY, velocityX, velocityY } = splatStack[i];
        
          // Generate a random color using HSV
          const h = Math.random();
          const s = 1.0;
          const v = 1.0;
          const { r, g, b } = HSVtoRGB(h, s, v);
        
          // Adjust intensity if needed
          const colorIntensity = 0.3;
          const color = new Vector3(r * colorIntensity, g * colorIntensity, b * colorIntensity);
        
          // Set up the splat shader uniforms
          setShaderMaterial('splat');
          setUniforms('splat', 'uTarget', FBOs.velocity.read.texture);
          setUniforms('splat', 'uPointer', new Vector2(mouseX, mouseY));
          setUniforms('splat', 'uColor', new Vector3(velocityX, velocityY, 0.0));
          setUniforms('splat', 'uRadius', radius / 100.0);
          setRenderTarget('velocity');
        
          setUniforms('splat', 'uTarget', FBOs.density.read.texture);
          // Use the generated color for the density splat
          setUniforms('splat', 'uColor', color);
          setRenderTarget('density');
        
          splatStack.pop();
        }
        

        setShaderMaterial('curl');
        setUniforms('curl', 'uVelocity', FBOs.velocity.read.texture);
        setRenderTarget('curl');

        // setShaderMaterial('vorticity');
        // setUniforms('vorticity', 'uVelocity', FBOs.velocity.read.texture);
        // setUniforms('vorticity', 'uCurl', FBOs.curl.texture);
        // setUniforms('vorticity', 'uCurlValue', curl);
        // setRenderTarget('velocity');

        setShaderMaterial('divergence');
        setUniforms('divergence', 'uVelocity', FBOs.velocity.read.texture);
        setRenderTarget('divergence');

        setShaderMaterial('clear');
        setUniforms('clear', 'uTexture', FBOs.pressure.read.texture);
        setUniforms('clear', 'uClearValue', pressure);
        setRenderTarget('pressure');

        setShaderMaterial('pressure');
        setUniforms('pressure', 'uDivergence', FBOs.divergence.texture);

        for (let i = 0; i < swirl; i++) {
            setUniforms('pressure', 'uPressure', FBOs.pressure.read.texture);
            setRenderTarget('pressure');
        }

        setShaderMaterial('gradientSubstract');
        setUniforms('gradientSubstract', 'uPressure', FBOs.pressure.read.texture);
        setUniforms('gradientSubstract', 'uVelocity', FBOs.velocity.read.texture);
        setRenderTarget('velocity');

        setShaderMaterial('advection');
        setUniforms('advection', 'uVelocity', FBOs.velocity.read.texture);
        setUniforms('advection', 'uSource', FBOs.velocity.read.texture);
        setUniforms('advection', 'uDissipation', velocityDissipation);

        setRenderTarget('velocity');
        setUniforms('advection', 'uVelocity', FBOs.velocity.read.texture);
        setUniforms('advection', 'uSource', FBOs.density.read.texture);
        setUniforms('advection', 'uDissipation', densityDissipation);

        setRenderTarget('density');

        // // Bloom Prefilter: Extract bright areas
        // setShaderMaterial('bloomPrefilter');
        // setUniforms('bloomPrefilter', 'uTexture', FBOs.density.read.texture);
        // setUniforms('bloomPrefilter', 'threshold', bloomThreshold); // Define bloomThreshold
        // setRenderTarget('bloom');


        // // Bloom Blur Passes (perform multiple iterations for better blur)
        // for (let i = 0; i < 3; i++) {
        //     setShaderMaterial('bloomBlur');
        //     setUniforms('bloomBlur', 'uTexture', FBOs.bloom.read.texture);
        //     setRenderTarget('bloom');
        //     // Swap FBOs if needed
        // }

        // Sunrays Mask: Generate mask from the bloom texture
        setShaderMaterial('sunraysMask');
        setUniforms('sunraysMask', 'uTexture', FBOs.density.read.texture);
        setRenderTarget('sunraysTemp');

        // Sunrays Passes (perform multiple iterations for better rays)
        for (let i = 0; i < 3; i++) {
            setShaderMaterial('sunrays');
            setUniforms('sunrays', 'sunPosition', new Vector2(lastMouseX, lastMouseY));
            setUniforms('sunrays', 'uTexture', FBOs.sunraysTemp.texture);
            setUniforms('sunrays', 'weight', sunraysWeight);     // Define sunraysWeight
            setUniforms('sunrays', 'decay', sunraysDecay);       // Define sunraysDecay
            setUniforms('sunrays', 'exposure', sunraysExposure); // Define sunraysExposure
            setRenderTarget('sunrays');

            // Swap FBOs if needed
        }

        // Final display
        meshRef.current.material = materials['display'];
        materials['display'].uniforms.uTexture.value = FBOs.density.read.texture;
        materials['display'].uniforms.uBloomTexture.value = FBOs.bloom.read.texture;
        materials['display'].uniforms.uSunraysTexture.value = FBOs.sunrays.read.texture;
        materials['display'].uniforms.bloomIntensity.value = bloomIntensity;
        materials['display'].uniforms.sunraysIntensity.value = sunraysExposure;

        gl.setRenderTarget(null);
        gl.clear();
        gl.render(scene, camera);
    });

    return (
        <mesh
          ref={meshRef}
          onPointerMove={onPointerMove}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          scale={[size.width, size.height, 1]}
        >
          <planeGeometry args={[2, 2]} />
        </mesh>
      );
      
      
};
