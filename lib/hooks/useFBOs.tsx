import * as THREE from 'three';

import { useFBO } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { useDoubleFBO } from '../hooks/useDoubleFBO';
import { OPTS } from '../constant';

export const useFBOs = () => {
    const density = useDoubleFBO(OPTS.dyeRes, OPTS.dyeRes, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        depth: false,
    });

    const velocity = useDoubleFBO(OPTS.simRes, OPTS.simRes, {
        type: THREE.HalfFloatType,
        format: THREE.RGFormat,
        minFilter: THREE.LinearFilter,
        depth: false,
    });

    const pressure = useDoubleFBO(OPTS.simRes, OPTS.simRes, {
        type: THREE.HalfFloatType,
        format: THREE.RedFormat,
        minFilter: THREE.NearestFilter,
        depth: false,
    });

    const divergence = useFBO(OPTS.simRes, OPTS.simRes, {
        type: THREE.HalfFloatType,
        format: THREE.RedFormat,
        minFilter: THREE.NearestFilter,
        depth: false,
    });

    const curl = useFBO(OPTS.simRes, OPTS.simRes, {
        type: THREE.HalfFloatType,
        format: THREE.RedFormat,
        minFilter: THREE.NearestFilter,
        depth: false,
    });

    const bloom = useDoubleFBO(OPTS.dyeRes, OPTS.dyeRes, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        depth: false,
      });
      
      const sunrays = useDoubleFBO(OPTS.dyeRes, OPTS.dyeRes, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        depth: false,
      });
      
      const sunraysTemp = useFBO(OPTS.dyeRes, OPTS.dyeRes, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        depth: false,
      });

    const FBOs = useMemo(() => {
        return {
            density,
            velocity,
            pressure,
            divergence,
            bloom,
            sunrays,
            sunraysTemp,
            curl,
        };
    }, [curl, density, divergence, pressure, velocity]);

    useEffect(() => {
        return () => {
            for (const FBO of Object.values(FBOs)) {
                FBO.dispose();
            }
        };
    }, [FBOs]);

    return FBOs;
};
