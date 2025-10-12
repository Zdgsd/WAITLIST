// components/scenes/ExitScene.tsx
import React from 'react';
import { useTypewriter } from '../../hooks/useTypewriter';

export const ExitScene: React.FC = () => {
    const { displayText, isComplete } = useTypewriter("Alright, Thank You! We Will See You Soon", 80);
    return (
        <div className="flex items-center justify-center h-full text-center p-4">
            <p className="text-3xl md:text-5xl">
                {displayText}
                {!isComplete && <span className="animate-blink">_</span>}
            </p>
        </div>
    )
}