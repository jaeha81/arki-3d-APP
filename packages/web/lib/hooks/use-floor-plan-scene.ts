'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FloorPlanEngine,
  type FloorPlanState,
  type FloorPlan,
  buildScene,
  type SceneData,
} from '@spaceplanner/engine'

let moduleEngine: FloorPlanEngine | null = null

function getEngine(): FloorPlanEngine {
  if (!moduleEngine) {
    moduleEngine = new FloorPlanEngine()
  }
  return moduleEngine
}

interface FloorPlanSceneResult {
  floorPlan: FloorPlan | null
  sceneData: SceneData | null
  selectedId: string | null
  engine: FloorPlanEngine
}

export function useFloorPlanScene(): FloorPlanSceneResult {
  const engine = getEngine()
  const [state, setState] = useState<FloorPlanState | null>(null)

  useEffect(() => {
    setState(engine.getState())
    const unsub = engine.subscribe((newState: FloorPlanState) => {
      setState(newState)
    })
    return unsub
  }, [engine])

  const floorPlan = state?.floorPlan ?? null
  const selectedId = state?.selectedId ?? null

  const sceneData = floorPlan ? buildScene(floorPlan) : null

  return { floorPlan, sceneData, selectedId, engine }
}
