/**
 * Indian 5x5 Bingo Engine Logic
 * 
 * 12 Possible Line Combinations:
 * - Rows 0..4 (indices 0..4, 5..9, 10..14, 15..19, 20..24)
 * - Columns 0..4 (indices 0..20, 1..21, 2..22, 3..23, 4..24)
 * - Diagonals: TopLeft-BottomRight (0,6,12,18,24), TopRight-BottomLeft (4,8,12,16,20)
 */

export const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'];

export const WINNING_LINE_PATTERNS = [
  // 5 Rows
  { id: 'row-0', indices: [0, 1, 2, 3, 4], type: 'row', index: 0 },
  { id: 'row-1', indices: [5, 6, 7, 8, 9], type: 'row', index: 1 },
  { id: 'row-2', indices: [10, 11, 12, 13, 14], type: 'row', index: 2 },
  { id: 'row-3', indices: [15, 16, 17, 18, 19], type: 'row', index: 3 },
  { id: 'row-4', indices: [20, 21, 22, 23, 24], type: 'row', index: 4 },

  // 5 Columns
  { id: 'col-0', indices: [0, 5, 10, 15, 20], type: 'col', index: 0 },
  { id: 'col-1', indices: [1, 6, 11, 16, 21], type: 'col', index: 1 },
  { id: 'col-2', indices: [2, 7, 12, 17, 22], type: 'col', index: 2 },
  { id: 'col-3', indices: [3, 8, 13, 18, 23], type: 'col', index: 3 },
  { id: 'col-4', indices: [4, 9, 14, 19, 24], type: 'col', index: 4 },

  // 2 Diagonals
  { id: 'diag-main', indices: [0, 6, 12, 18, 24], type: 'diag', index: 0 }, // \
  { id: 'diag-anti', indices: [4, 8, 12, 16, 20], type: 'diag', index: 1 }, // /
];

/**
 * Generate a randomly shuffled array of numbers 1..25
 */
export function generateRandomGrid() {
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

/**
 * Validate whether a grid contains exactly numbers 1 to 25 uniquely.
 */
export function isValidGrid(grid) {
  if (!Array.isArray(grid) || grid.length !== 25) return false;
  const numSet = new Set(grid.filter(n => n !== null && n !== undefined && n >= 1 && n <= 25));
  return numSet.size === 25;
}

/**
 * Evaluate completed lines on a board given a set of crossed numbers.
 * @param {Array<number>} grid - 25 numbers on player's board
 * @param {Array<number>|Set<number>} crossedNumbers - Numbers marked off
 * @returns {Object} { completedLines: Array<Pattern>, count: number, letters: Array<string>, isWin: boolean }
 */
export function evaluateGrid(grid, crossedNumbers) {
  if (!grid || grid.length !== 25) {
    return { completedLines: [], count: 0, letters: [], isWin: false };
  }

  const crossedSet = crossedNumbers instanceof Set ? crossedNumbers : new Set(crossedNumbers);

  const completedLines = WINNING_LINE_PATTERNS.filter(pattern => {
    return pattern.indices.every(idx => {
      const num = grid[idx];
      return num && crossedSet.has(num);
    });
  });

  const count = completedLines.length;
  const unlockedLetters = BINGO_LETTERS.slice(0, Math.min(5, count));
  const isWin = count >= 5;

  return {
    completedLines,
    count,
    letters: unlockedLetters,
    isWin,
  };
}

/**
 * AI move decision algorithm (plays smart in vs AI mode)
 * Finds the number on AI grid that contributes most to completing a line for AI.
 */
export function getSmartAIMove(aiGrid, crossedNumbers) {
  const crossedSet = crossedNumbers instanceof Set ? crossedNumbers : new Set(crossedNumbers);
  const uncrossedIndices = aiGrid
    .map((num, idx) => (num && !crossedSet.has(num) ? { num, idx } : null))
    .filter(Boolean);

  if (uncrossedIndices.length === 0) return null;

  // Score each remaining uncrossed number based on how many almost-completed lines it belongs to
  let bestScore = -1;
  let bestMove = uncrossedIndices[0].num;

  for (const { num, idx } of uncrossedIndices) {
    let score = 0;
    for (const pattern of WINNING_LINE_PATTERNS) {
      if (pattern.indices.includes(idx)) {
        // Count how many numbers in this line are already crossed
        const crossedInLine = pattern.indices.filter(i => crossedSet.has(aiGrid[i])).length;
        // Lines closer to completion give exponential weight
        score += Math.pow(2, crossedInLine);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMove = num;
    }
  }

  return bestMove;
}
