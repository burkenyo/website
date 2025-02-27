<!-- Copyright © 2024 Samuel Justin Speth Gabay
     Licensed under the GNU Affero Public License, Version 3 -->

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { Permutation } from "@melodies/permutation";
import ConstantsListing from "@melodies/components/ConstantsListing.vue";
import { BASE, INITIAL_OEIS_ID, MAX_PERMUTATION, useState } from "@melodies/state";
import { Fractional } from "@melodies/oeis";
import ConstantIcon from "@melodies/components/ConstantIcon.vue";
import OeisLinks from "@melodies/components/OeisLinks";
import Info from "@melodies/components/MelodiesInfo.md";
import ScriptingDisabledWarning from "@shared/components/ScriptingDisabledWarning.vue";
import ScoreRenderer from "@melodies/components/ScoreRenderer.vue";
import WaitSpinner from "@shared/components/WaitSpinner.vue";

var constantReady = ref(false);

const state = useState();
state.startApiWarmUp();

const inputs = reactive({
  number: 1,
  offset: 0,
});

watch(inputs, () => {
  console.debug("App.vue inputs watch triggered");
  // TODO is there a better way?
  if (document.querySelector(":invalid")) {
    return;
  }

  state.updatePermutation(Permutation.create(BASE, inputs.number, inputs.offset));
});

const DISPLAY_NOTES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"] as const;
const DISPLAY_DIGIT_MAP = "0123456789XL";
const noteSequence = computed(() => state.permutation.sequence.map(e => DISPLAY_NOTES[e]));
const expansionPreview = computed(() => {
  if (!state.expansion) {
    return { text: "", abbreviated: false };
  }

  const fullString = String(state.expansion.expansion);

  const displayString = String(state.expansion.expansion)
    .slice(0, 90)
    .split("")
    .map(c => {
      const index = Fractional.DOZENAL_DIGIT_MAP.indexOf(c);

      return index > -1
        ? DISPLAY_DIGIT_MAP.charAt(index)
        : c
    })
    .join("");

  return {text: displayString, abbreviated: fullString.length > displayString.length};
});

watch([() => state.permutation, () => state.expansion], () => {
  console.debug("[() => state.permutation, () => state.expansion] watch triggered in App.vue");

  inputs.number = state.permutation.number;
  inputs.offset = state.permutation.offset;
});

function fixUpName(name: string): string {
  if (name.startsWith("Decimal")) {
    name = "the " + name;
  }

  // remove the word decimal (because we’re in dozenal) and any final period from the description
  return name.replace(/[Dd]ecimal |\.$/g, "");
}

state.getExpansionById(INITIAL_OEIS_ID);
</script>

<template>
  <ScriptingDisabledWarning />
  <Info />
  <h3>Sequence</h3>
  <div>
    <div class="spinner">
      <WaitSpinner v-if="!constantReady" />
    </div>
    <div :class="constantReady ? undefined : 'translucent'">
      <ConstantsListing @readystatechange="ready => constantReady = ready" />
      <h4>Digits</h4>
      <p>
        <OeisLinks v-if="state.selectedInterestingConstant">
          <ConstantIcon :tag="state.selectedInterestingConstant.tag" />,
          {{ state.selectedInterestingConstant.description }} ({{ state.selectedInterestingConstant.id }}),
        </OeisLinks>
        <OeisLinks v-else-if="state.expansion">
          {{ state.expansion.id }}, {{ fixUpName(state.expansion.name) }}
        </OeisLinks>
        is
        <span id="digits-bold" class="sans">{{ expansionPreview.text }}</span>
        <template v-if="expansionPreview.abbreviated">...</template>
      </p>
    </div>
  </div>
  <h3>Permutation</h3>
  <span class="control-group">
    <label for="permutation-number">number</label>
    <input id="permutation-number" class="wide" required type="number" min="1" :max="MAX_PERMUTATION" v-model="inputs.number" />
  </span>
  <span class="control-group">
    <label for="offset">transposition</label>
    <input id="offset"  class="narrow" required type="number" min="0" :max="BASE - 1" v-model="inputs.offset" />
  </span>
  <span class="control-group">
    <button @click="state.randomizePermutation">random</button>
  </span>
  <span class="control-group">
    <button @click="state.reversePermutation">reverse</button>
    <button @click="state.reflectPermutation">reflect</button>
    <button @click="state.invertPermutation">invert</button>
  </span>
  <h4>Mapping</h4>
  <table>
    <tr>
      <td class="key" v-for="d in DISPLAY_DIGIT_MAP" :key="d">
        {{ d }}
      </td>
    </tr>
    <tr>
      <td class="key" v-for="note in noteSequence" :key="note">
        {{ note }}
      </td>
    </tr>
  </table>
  <h3>Generated Melody</h3>
  <ScoreRenderer />
</template>

<style scoped>
div.spinner {
  position: absolute;
  left: 10em;
  margin: .5em;
}
</style>
