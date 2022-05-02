<script>
  export let step

  import { tweened } from 'svelte/motion'
  import { quartInOut } from 'svelte/easing'

  let width
  let height

  const margin = { top: 50, bottom: 30, left: 30, right: 30 }

  const baseRankings = [
    [
      12, 9, 19, 22, 35, 25, 37, 27, 48, 36, 59, 45, 38, 42, 0, 17, 30, 2, 33, 28, 26, 56, 3, 40, 16, 41, 1, 32, 47, 21,
      55, 14, 50, 23, 34, 24, 39, 5, 13, 43, 31, 20, 52, 44, 18, 53, 51, 11, 4, 15, 8, 57, 49, 58, 7, 29, 10, 54, 6, 46,
    ],
    [
      19, 37, 9, 36, 45, 38, 59, 48, 5, 32, 35, 41, 22, 16, 27, 42, 25, 17, 26, 21, 30, 56, 1, 2, 14, 23, 33, 40, 3, 12,
      28, 18, 8, 34, 53, 55, 0, 44, 29, 52, 13, 31, 43, 39, 20, 47, 57, 24, 50, 51, 54, 11, 49, 58, 4, 6, 7, 15, 10, 46,
    ],
    [
      19, 37, 36, 38, 9, 41, 35, 45, 5, 12, 22, 33, 2, 42, 32, 48, 1, 25, 17, 3, 21, 14, 16, 27, 29, 59, 26, 30, 43, 44,
      28, 53, 8, 18, 23, 40, 13, 0, 34, 31, 47, 56, 55, 57, 20, 49, 52, 58, 39, 50, 51, 24, 11, 4, 54, 15, 7, 10, 46, 6,
    ],
  ]

  // const consensusRanking = [
  //   19, 37, 9, 36, 45, 38, 35, 48, 41, 12, 22, 5, 59, 42, 25, 27, 32, 17, 2, 33, 16, 30, 26, 21, 3, 1, 56, 28, 14, 23,
  //   40, 18, 0, 34, 53, 44, 8, 43, 55, 29, 13, 47, 31, 52, 39, 20, 57, 50, 24, 51, 11, 49, 58, 4, 54, 15, 7, 10, 6, 46,
  // ]
  const consensusRanking = [
    19, 37, 9, 36, 45, 38, 35, 48, 41, 12, 22, 5, 59, 42, 25, 27, 26, 16, 2, 33, 21, 30, 32, 3, 23, 1, 56, 28, 14, 8,
    40, 18, 31, 34, 53, 44, 58, 13, 54, 43, 52, 15, 6, 20, 46, 50, 17, 29, 0, 47, 57, 24, 55, 51, 39, 49, 11, 10, 4, 7,
  ]
  const allRankings = [...baseRankings, consensusRanking]

  const totalRankings = allRankings.length
  const totalCandidates = consensusRanking.length
  const totalBaseRankings = baseRankings.length

  let initialCandidate = 12

  $: consensusPosition = consensusRanking.indexOf(initialCandidate)
  $: candidateDiff = baseRankings.map((ranking) => consensusPosition - ranking.indexOf(initialCandidate))
  $: candidateHeight = (height - margin.top - margin.bottom || 200) / totalCandidates
  $: rankerWidth = (width - margin.left - margin.right || 200) / totalRankings

  const lineTweenOptions = {
    delay: 0,
    duration: 1000,
    easing: quartInOut,
  }
  const fadeTweenOptions = {
    delay: 0,
    duration: 500,
    easing: quartInOut,
  }

  const l1Opacity = tweened(0, fadeTweenOptions)
  // const p1 = tweened([20, 20], lineTweenOptions)
  const highlightLines = tweened(
    baseRankings.map((ranking) => ({ x1: 20, y1: 20, x2: 20, y2: 20 })),
    lineTweenOptions,
  )

  // const consensusPositions = consensusRanking.filter((a, i) => i === 1)

  const allDiffs = consensusRanking
    .filter((a, i) => i < 100)
    .map((ranking, i) => {
      return baseRankings.map((baseRanking, j) => i - baseRanking.indexOf(ranking))
    })

  const diffLines = tweened(
    allDiffs.map((diffs, consensusPosition) =>
      diffs.map((diff, i) => {
        let a = (consensusPosition - diff) * candidateHeight
        let b = consensusPosition * candidateHeight
        // return {
        //   x1: i * rankerWidth + 20,
        //   y1: a > b ? a : b,
        //   x2: i * rankerWidth + 20,
        //   y2: a > b ? b : a,
        // }
        return {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0,
        }
      }),
    ), //{ x1: 20, y1: 20, x2: 20, y2: 20 })),
    // allDiffs.map((diffs) => ({ x1: 20, y1: 20, x2: 20, y2: 20 })),
    lineTweenOptions,
  )

  // const p2 = tweened([50, 60], lineTweenOptions)

  $: if (step === 0) {
    l1Opacity.set(0)

    highlightLines.set(
      candidateDiff.map((diff, i) => {
        const a = (consensusPosition - diff) * candidateHeight
        const b = consensusPosition * candidateHeight
        return {
          x1: i * rankerWidth + 20,
          y1: a > b ? a : b,
          x2: i * rankerWidth + 20,
          y2: a > b ? b : a,
        }
      }),
    )
  } else if (step === 1) {
    l1Opacity.set(1)
    highlightLines.set(
      candidateDiff.map((diff, i) => {
        const a = (consensusPosition - diff) * candidateHeight
        const b = consensusPosition * candidateHeight
        return {
          x1: i * rankerWidth + 20,
          y1: a > b ? a : b,
          x2: i * rankerWidth + 20,
          y2: a > b ? b : a,
        }
      }),
    )
  } else if (step === 2) {
    l1Opacity.set(1 / totalBaseRankings)

    highlightLines.set(
      candidateDiff.map((diff, i) => {
        const a = (consensusPosition - diff) * candidateHeight
        const b = consensusPosition * candidateHeight
        return {
          x1: totalBaseRankings * rankerWidth + 20,
          y1: a > b ? a : b,
          x2: totalBaseRankings * rankerWidth + 20,
          y2: a > b ? b : a,
        }
      }),
      // candidateDiff.map((diff, i) => ({
      //   x1: totalBaseRankings * rankerWidth + rankerWidth / 2,
      //   y1: consensusPosition * candidateHeight,
      //   x2: totalBaseRankings * rankerWidth + rankerWidth / 2 + diff * 5,
      //   y2: consensusPosition * candidateHeight,
      // })),
    )
  } else if (step === 3) {
    l1Opacity.set(1 / totalBaseRankings)
    highlightLines.set(
      candidateDiff.map((diff, i) => {
        const a = totalBaseRankings * rankerWidth + rankerWidth / 2
        const b = totalBaseRankings * rankerWidth + rankerWidth / 2 - diff * 5
        return {
          x1: a > b ? a : b,
          y1: consensusPosition * candidateHeight,
          x2: a > b ? b : a,
          y2: consensusPosition * candidateHeight,
        }
      }),
    )
  } else if (step === 4) {
    l1Opacity.set(1 / totalBaseRankings)

    diffLines.set(
      allDiffs.map((diffs, consensusPosition) =>
        diffs.map((diff, i) => {
          let a = (consensusPosition - diff) * candidateHeight
          let b = consensusPosition * candidateHeight
          return {
            x1: i * rankerWidth + 20 + 2 * consensusPosition,
            y1: a > b ? a : b,
            x2: i * rankerWidth + 20 + 2 * consensusPosition,
            y2: a > b ? b : a,
          }
        }),
      ),
    )
  } else if (step === 5) {
    // l1Opacity.set(1 / totalBaseRankings)
    diffLines.set(
      allDiffs.map((diffs, consensusPosition) =>
        diffs.map((diff, i) => {
          const a = (consensusPosition - diff) * candidateHeight
          const b = consensusPosition * candidateHeight
          return {
            x1: totalBaseRankings * rankerWidth + 20 + 2 * consensusPosition,
            y1: a > b ? a : b,
            x2: totalBaseRankings * rankerWidth + 20 + 2 * consensusPosition,
            y2: a > b ? b : a,
          }
        }),
      ),
    )
  } else if (step === 6) {
    diffLines.set(
      allDiffs.map((diffs, consensusPosition) =>
        diffs.map((diff, i) => {
          const a = totalBaseRankings * rankerWidth + rankerWidth / 2
          const b = totalBaseRankings * rankerWidth + rankerWidth / 2 - diff * 5
          return {
            x1: a > b ? a : b,
            y1: consensusPosition * candidateHeight,
            x2: a > b ? b : a,
            y2: consensusPosition * candidateHeight,
          }
        }),
      ),
    )
  }
</script>

<div class="chart-container" bind:offsetWidth={width} bind:offsetHeight={height}>
  <!-- <svg width={width ? width + margin.right + margin.left : 20} {height}> -->
  <svg {width} {height}>
    <g transform="translate({margin.left}, {margin.top})">
      {#each allRankings as ranking, i}
        <g transform="translate({i * rankerWidth}, 0)">
          {#if i < 3}
            <text transform="translate(0, -4)" class="ranker-name">R{i + 1}</text>
          {:else}
            <text transform="translate(0, -4)" class="ranker-name">C</text>
          {/if}
          {#each ranking as candidate, j}
            <g transform="translate(0, {j * candidateHeight})">
              <text class="candidate-name {candidate === initialCandidate ? 'selected' : ''}" dy="5px">{candidate}</text
              >
              <rect x={-candidateHeight / 2} y="0" width="50" height={candidateHeight} fill="transparent" />
            </g>
          {/each}
        </g>
      {/each}
    </g>
    <g transform="translate({margin.left}, {margin.top})">
      <line
        x1={baseRankings.length * rankerWidth + rankerWidth / 2}
        y1={0}
        x2={baseRankings.length * rankerWidth + rankerWidth / 2}
        y2={totalCandidates * candidateHeight}
        stroke="rgba(0,0,0,.1)"
        stroke-width={1}
        stroke-linecap="round"
      />
      <line
        x1={0}
        y1={consensusPosition * candidateHeight}
        x2={baseRankings.length * rankerWidth + rankerWidth}
        y2={consensusPosition * candidateHeight}
        stroke="rgba(0,0,0,0.1)"
        stroke-width={1}
        stroke-linecap="round"
      />
      {#if step <= 3}
        {#each baseRankings as ranking, i}
          <line
            x1={$highlightLines[i].x1}
            y1={$highlightLines[i].y1}
            x2={$highlightLines[i].x2}
            y2={$highlightLines[i].y2}
            stroke="steelblue"
            opacity={$l1Opacity}
            stroke-width={5}
            stroke-linecap="round"
          />
        {/each}
      {/if}
      {#if step > 3}
        {#each $diffLines as diffLine, i}
          {#each diffLine as line, j}
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="steelblue"
              opacity={0.333333}
              stroke-width={step > 5 ? 5 : 2}
              stroke-linecap="round"
            />
          {/each}
        {/each}
      {/if}
    </g>
  </svg>

  <!-- {(console.log(candidateHeight))} -->
  <!-- {(console.log(candidateHeight), '')} -->
  <!-- {(console.log(candidateDiff), '')} -->
  <!-- {(console.log($diffLines), '')} -->
</div>

<style>
  .chart-container {
    height: 80vh;
    max-width: 100%;
    background: #f9f9f9;
    /* background: linear-gradient(to bottom right, steelblue -100%, white 100%); */
    border-radius: 5px;
    box-shadow: 0px 2px 5px #cecece;
    border: 1px solid #bbb;
  }

  .candidate-name {
    font-size: 10px;
    fill: #777;
  }

  .candidate-name.selected {
    font-weight: 700;
    fill: #000;
  }

  .ranker-name {
    font-size: 12px;
    font-weight: 700;
  }
</style>
