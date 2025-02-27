<!-- Copyright © 2024 Samuel Justin Speth Gabay
     Licensed under the GNU Affero Public License, Version 3 -->

<script setup lang="ts">
import { INITIAL_OEIS_ID, interestingConstantsInfo, useState } from "@melodies/state";
import { reactive, ref, watch, type Ref } from "vue";
import { OeisId } from "@melodies/oeis";
import ConstantIcon from "./ConstantIcon.vue";

const emit = defineEmits<{
  (e: 'readystatechange', ready: boolean): void
}>();

const state = useState();

const inputs = reactive({
  selected: ref(String(INITIAL_OEIS_ID)),
  entered: ref(String(INITIAL_OEIS_ID)),
});
const ready = ref(true);
let timeoutId = 0;
watch(inputs, () => {
  console.debug("ConstantsListing.vue inputs watch triggered");
  const parsedOeisId = customRadio.value?.checked
    ? OeisId.parse(inputs.entered)
    : OeisId.parse(inputs.selected);

  // The watch might have been triggered because:
  //   • inputs.entered was set to be the same as inputs.selected when inputs.selected changed
  //   • inputs.entered was changed to pad with zeroes as the user typed
  // But if the actual value of the OeisID has not changed, bail
  if (parsedOeisId.equals(state.expansion?.id)) {
    console.debug("ConstantsListing.vue inputs update canceled because of OeisId equality");
    return;
  }

  window.clearTimeout(timeoutId);

  // TODO is there a better way?
  if (document.querySelector(":invalid")) {
    return;
  }

  inputs.entered = String(parsedOeisId);

  // use a timeout to avoid updating the state with every keystroke
  timeoutId = window.setTimeout(async () => {
    try {
      ready.value = false;
      state.getExpansionById(parsedOeisId);
    } finally {
      ready.value = true;
    }
  }, 200);
});

watch(() => state.expansion, () => {
  console.debug("[() => state.expansion] watch triggered in ConstantsListing.vue");
  inputs.entered = String(state.expansion!.id);
});

function getRandom() {
  window.clearTimeout(timeoutId);

  checkCustomRadio();

  timeoutId = window.setTimeout(async () => {
    try {
      ready.value = false;
      await state.getRandomExpansion();
    } finally {
      ready.value = true;
    }
  }, 50);
}

const customInput = ref<HTMLInputElement>();
const customRadio = ref<HTMLInputElement>();

let enteringCustom = false;
function checkCustomRadio() {
  if (customRadio.value && !enteringCustom) {
    customRadio.value.checked = true;
  }
}

function focusCustomInput() {
  if (customInput.value && customRadio.value?.checked) {
    enteringCustom = true;

    customInput.value.focus();

    enteringCustom = false;
  }
}

watch(ready, () => emit("readystatechange", ready.value), { immediate: true });
</script>

<template>
  <div style="position: relative">
    <div style="width: fit-content">
      <span class="control-group">
        <template v-for="item in interestingConstantsInfo" :key="item.tag">
          <label class="form-check-label" :for="item.tag">
            <ConstantIcon :tag="item.tag" />
          </label>
          <input type="radio" :value="String(item.id)" :id="item.tag" v-model="inputs.selected" name="constant" :disabled="!ready" />
        </template>
      </span>
      <span class="control-group">
        <label for="custom-radio">custom</label>
        <input type="radio" id="custom-radio" ref="customRadio" name="constant" @change="focusCustomInput" :disabled="!ready"/>
        <input class="wide" required v-model="inputs.entered" ref="customInput" pattern="[Aa]?0*[1-9]\d{0,8}" @focus="checkCustomRadio" :disabled="!ready"/>
        <button @click="getRandom" :disabled="!ready">random</button>
      </span>
    </div>
  </div>
</template>
