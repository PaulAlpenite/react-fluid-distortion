import { ThreeEvent, useThree } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import { Vector2 } from 'three';

type SplatStack = {
    mouseX?: number;
    mouseY?: number;
    velocityX?: number;
    velocityY?: number;
};

export const usePointer = ({ force }: { force: number }) => {
    const size = useThree((three) => three.size);

    const splatStack: SplatStack[] = useRef([]).current;

    const lastMouse = useRef<Vector2>(new Vector2());
    const hasMoved = useRef<boolean>(false);

    const onPointerMove = useCallback(
        (event: ThreeEvent<PointerEvent>) => {
            if (!hasMoved.current) {
                hasMoved.current = true;
                lastMouse.current.set(event.x, event.y);
                return; // Return early on the first move
            }
    
            const deltaX = event.x - lastMouse.current.x;
            const deltaY = event.y - lastMouse.current.y;
    
            lastMouse.current.set(event.x, event.y);
    
            splatStack.push({
                mouseX: event.x / size.width,
                mouseY: 1.0 - event.y / size.height,
                velocityX: deltaX * force,
                velocityY: -deltaY * force,
            });
        },
        [force, size.height, size.width, splatStack],
    );
    

    return { onPointerMove, splatStack };
};
