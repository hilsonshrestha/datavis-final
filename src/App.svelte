<script>
  /**
   *  Reference: Connor Rothschild https://twitter.com/CL_Rothschild
   *  Scrollytelling component from Russell Goldenberg https://twitter.com/codenberg/status/1432774653139984387
   */

  import Scrolly from './Scrolly.svelte'
  import Consensus from './Consensus.svelte'
  import CompareConsensus from './CompareConsensus.svelte'

  let value
</script>

<section>
  <div class="hero">
    <h1>Visualizing Consensus</h1>
    <h2>By Hilson Shrestha and Kartik Nautiyal</h2>
    <p style="max-width:800px">
      Decision making involves clashing of opinions of multiple stakeholders to reach a reasonable agreement between
      them. One of such scenarios includes the use of rankings.
    </p>

    <p style="max-width:800px">
      In this visualization, we attempt to explain the level of agreement or disagreement in a consensus ranking, and
      eventually compare between multiple consensus rakings.
    </p>
  </div>
  <div class="section-container">
    <div class="steps-container">
      <Scrolly bind:value>
        <div class="step" class:active={value === 0}>
          <div class="step-content">
            <p class="w-text">
              Let's say we have 60 candidates with id from 0 to 59. And let's say we have 3 stakeholders (<strong
                >R1</strong
              >, <strong>R2</strong> and <strong>R3</strong>) who rank the set of 60 candidates. And let's say
              <strong>C</strong> is a consensus ranking that they agreed upon. These rankings are shown on the right.
              <!-- Reaching consensus in a ranking is an interesting problem where a group of rankers decide on ranking a pool of
              candidates. Each ranker is driven by their own thoughts and has to deal with balancing agreement and
              disagreement with other rankers. -->
            </p>

            <!-- Given a set of candidates to rank from and a group of rankers who decide on the ranking, there can be
            different version of consensus when certain constraints are applied. -->
          </div>
        </div>
        <div class="step" class:active={value === 1}>
          <div class="step-content">
            <p>Let's see how much disagreement is present on the consensus ranking when considering candidate <strong>12</strong></p>
            <p>We draw a line from the position of 12 in consensus ranking and then highlight the difference to that line of each base ranking's position of candidate 12.</p>
            <!-- <p>We try to see how far off the rankings are in each of the rankings made by the stakeholder.</p> -->
            <!-- <p></p> -->
            <!-- How far off each base ranking on a candidate is from the consensus ranking</div> -->
          </div>
        </div>
        <div class="step" class:active={value === 2}>
          <div class="step-content">We now overlay all the differences...</div>
        </div>
        <div class="step" class:active={value === 3}>
          <div class="step-content">
            <p>And rotate it. This resulting line represents the amount of disagreement on candidate <strong>12</strong>.</p>
            <p>One of the stakeholder completely agrees to the consensus ranking and the other two disagrees.</p>
          </div>
        </div>
        <div class="step" class:active={value === 4}>
          <div class="step-content">Next, we do the same thing for all the candidates. We take all the differences...</div>
        </div>
        <div class="step" class:active={value === 5}>
          <div class="step-content">Overlay them...</div>
        </div>
        <div class="step" class:active={value === 6}>
          <div class="step-content">
            <p>And rotate each of the disagreement lines.</p>
            <p>We can now analyse the agreement/disagreement on individual candidate. We can clearly see that all the stakeholders disagree on the lower ranked candidates, especially candidate 17. </p></div>
        </div>
        <div class="spacer" />
      </Scrolly>
    </div>
    <div class="sticky p-20">
      <Consensus step={value} />
    </div>
  </div>
  <div>
    <CompareConsensus />
  </div>
  <div class="hero">
    <h1>Thanks!</h1>
  </div>
</section>

<style>
  :global(body) {
    overflow-x: hidden;
  }

  .hero {
    height: 60vh;
    display: flex;
    place-items: center;
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }

  .hero h2 {
    margin-top: 0;
    font-weight: 200;
  }

  .spacer {
    height: 40vh;
  }

  .sticky {
    position: sticky;
    top: 10vh;
    flex: 1 1 60%;
    width: 60%;
  }

  .section-container {
    margin-top: 1em;
    text-align: center;
    transition: background 100ms;
    display: flex;
  }

  .step {
    min-height: 80vh;
    display: flex;
    place-items: center;
    justify-content: center;
  }

  .step-content {
    font-size: 1rem;
    background: whitesmoke;
    color: #ccc;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    transition: background 500ms ease;
    box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.2);
    text-align: left;
    width: 75%;
    margin: auto;
    max-width: 500px;
  }

  .step.active .step-content {
    background: white;
    color: black;
  }

  .steps-container,
  .sticky {
    height: 100%;
  }

  .steps-container {
    flex: 1 1 40%;
    z-index: 10;
  }

  .p-20 {
    padding: 0 20px;
  }

  .w-text {
    max-width: 800px;
  }

  /* Comment out the following line to always make it 'text-on-top' */
  @media screen and (max-width: 768px) {
    .section-container {
      flex-direction: column-reverse;
    }
    .sticky {
      width: 95%;
      margin: auto;
    }
  }
</style>
