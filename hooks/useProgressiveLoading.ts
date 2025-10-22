import { useState, useEffect } from 'react';
import { AppPhase } from '../types';

export const useProgressiveLoading = (currentScene: AppPhase) => {
  const [loadedScenes, setLoadedScenes] = useState<Set<AppPhase>>(new Set([currentScene]));

  useEffect(() => {
    const preloadNextScenes = async () => {
      const sceneFlow: Record<AppPhase, AppPhase[]> = {
        [AppPhase.CORPORATE_SHELL]: [AppPhase.INITIALIZATION],
        [AppPhase.INITIALIZATION]: [AppPhase.IMAGINE_IF],
        [AppPhase.IMAGINE_IF]: [AppPhase.GLITCH_1],
        [AppPhase.GLITCH_1]: [AppPhase.MEMORY_PROMPT_1],
        [AppPhase.MEMORY_PROMPT_1]: [AppPhase.MEMORY_PROMPT_2],
        [AppPhase.MEMORY_PROMPT_2]: [AppPhase.BRAND_REVEAL],
        [AppPhase.BRAND_REVEAL]: [AppPhase.INVITATION_BOX],
        [AppPhase.INVITATION_BOX]: [AppPhase.MEMORY_EXCHANGE],
        [AppPhase.MEMORY_EXCHANGE]: [AppPhase.COMPLETION],
        [AppPhase.COMPLETION]: [AppPhase.INVESTOR_PAGE],
        [AppPhase.INVESTOR_PAGE]: [AppPhase.EXIT],
        [AppPhase.EXIT]: [],
      };

      const nextScenes = sceneFlow[currentScene] || [];
      
      for (const scene of nextScenes) {
        if (!loadedScenes.has(scene)) {
          await import(`../components/scenes/${scene}`).then(() => {
            setLoadedScenes(prev => new Set([...prev, scene]));
          });
        }
      }
    };

    preloadNextScenes();
  }, [currentScene, loadedScenes]);

  return loadedScenes;
};