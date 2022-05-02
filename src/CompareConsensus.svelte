<script>
  import { hsl } from 'd3'
  const margin = { top: 80, bottom: 10, left: 30, right: 30 }

  import baseRankings from '../data/baseRankings.json';
  import consensusRankings from '../data/consensusRankings.json';

  let width
  let height

  const allRankings = [...baseRankings, ...consensusRankings]

  let hoverRanker = null

  const totalCandidates = consensusRankings[0].length

  $: candidateHeight = (height - margin.top - margin.bottom || 200) / totalCandidates

  const diffConsensus = consensusRankings.map((consensusRanking, i) => {
    return consensusRanking.map((p, j) => {
      return baseRankings.map((b) => j - b.indexOf(p))
    })
  })

  const colors = ['red', 'blue', 'green', 'yellow']
  const desaturatedColors = colors.map((c) => {
    const dc = hsl(c)
    dc.s = 0.1
    return dc + ''
  })

  let activeRanker = null
  let activeCandidatePos = null
</script>

<div class="container">
  <div style="width:500px; text-align: left; margin: 0 auto; padding:2rem;">
    Here are the consensus rankings of 500 canidates ranked by 3 rankers. Each of the consensus rankings are
    algorithmically generated and subject to some constraints resulting in the variation. In this particular case, we
    applied FairCopeland algorithm to generate consensus rankings of different levels of fairness and we see that
    increasing the fairness results in more disagreement in the ranking.
  </div>
  <div class="chart-container" bind:offsetWidth={width} bind:offsetHeight={height}>
    <svg {height} {width}>
      <g>
        {#each baseRankings as b, i}
          <g
            on:mouseleave={() => {
              hoverRanker = null
            }}
            on:mouseenter={() => {
              hoverRanker = i
            }}
          >
            <rect x={20} y={20 * i + 10} height="20" width="20" fill={colors[i]} opacity="0.4" />
            <text x={50} y={20 * i + 20} dy="0.35em" font-weight={i === hoverRanker ? 'bold' : 'normal'}>R{i + 1}</text>
          </g>
        {/each}
      </g>
      <!-- Base rankings -->

      <!-- Consensus Rankings -->
      <g transform="translate({margin.left + 0}, {margin.top})">
        {#each diffConsensus as consensusRanking, i}
          <g transform="translate({i * 350 + 200}, 0)">
            <text text-anchor="middle" dy="-1em">C{i}</text>

            {#each consensusRanking as diffs, j}
              <g transform="translate(0, {j * candidateHeight})">
                {#each diffs as diff, k}
                  <line
                    x1="0"
                    y1="0"
                    x2={diff}
                    y2="0"
                    stroke={hoverRanker === null || hoverRanker === k ? colors[k] : desaturatedColors[k]}
                    opacity={hoverRanker === null || hoverRanker === k ? 0.4 : 0.25}
                    stroke-width="3"
                    on:mouseenter={() => {
                      activeCandidatePos = j
                      activeRanker = i
                    }}
                    on:mouseleave={() => {
                      activeCandidatePos = null
                      activeRanker = null
                    }}
                  />
                {/each}
              </g>
            {/each}
          </g>
        {/each}
        {#if activeRanker}
          <!-- tooltip -->
          <g transform="translate({activeRanker * 350 + 100}, {activeCandidatePos * candidateHeight - 10})">
            <rect x={-25} y={0} height="20" width="50" fill="white" stroke="#000"/>
            <text x={0} y={0} font-size="12px" dy="1.2em" text-anchor="middle" font-weight="bold">{consensusRankings[activeRanker][activeCandidatePos]}</text>
          </g>
        {/if}
      </g>
    </svg>
  </div>
</div>
{(console.log(consensusRankings), '')}

<style>
  .container {
    padding: 20px;
  }
  .chart-container {
    height: 80vh;
    max-width: 100%;
    background: #f9f9f9;
    border-radius: 5px;
    box-shadow: 0px 2px 5px #cecece;
    border: 1px solid #bbb;
    font-size: 10px;
  }
</style>
