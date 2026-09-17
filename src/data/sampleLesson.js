/**
 * Backward-compatible export of the first Level 1 lesson.
 * Prefer importing from data/lessons instead.
 */
import { getLevel1Lesson } from './lessons/level1.js'

export const SAMPLE_LESSON = getLevel1Lesson('l1-1')
