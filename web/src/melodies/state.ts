// Copyright © 2024 Samuel Justin Speth Gabay
// Licensed under the GNU Affero Public License, Version 3

import { defineStore } from "pinia";
import { shallowRef, readonly, computed } from "vue";
import { OeisFractionalExpansion, OeisId } from "@melodies/oeis";
import { Permutation } from "./permutation";
import { serviceKeys, useServices } from "./services";
import type { ApiRunner } from "./services/apiRunner";

interface InterestingConstant {
  readonly tag: string;
  readonly id: OeisId;
  readonly description: string;
}

export const interestingConstantsInfo: readonly InterestingConstant[] = [
  {
    tag: "pi",
    id: new OeisId(796),
    description: "Pi, the ratio of a circle’s circumference to its diameter",
  },
  {
    tag: "e",
    id: new OeisId(1113),
    description: "the base of the natural logarithm",
  },
  {
    tag: "gamma",
    id: new OeisId(1620),
    description: "Gamma, the Euler-Mascheroni constant",
  },
  {
    tag: "phi",
    id: new OeisId(1622),
    description: "Phi, the golden ratio",
  },
  {
    tag: "root_two",
    id: new OeisId(2193),
    description: "the square-root of two",
  },
  {
    tag: "twelfth_root_two",
    id: new OeisId(10774),
    description: "the ratio of the pitches of any two neighboring notes on the chromatic scale",
  },
  {
    tag: "tau",
    id: new OeisId(19692),
    description: "Tau, two times pi, the ratio of a circle’s circumference to its radius",
  },
];

export const INITIAL_OEIS_ID = interestingConstantsInfo[0].id;

export const BASE = 12;

export const MAX_PERMUTATION = Permutation.getMaxNumber(BASE);

// State uses immutable domain types, hence shallow refs.
// Functions that mutate the state check for domain type equality before committing the updates.
// This should prevent false-positives in watches monitoring (all or part of) the state.
export const useState = defineStore("state", () => {
  // don’t use the ApiRunner during the build step
  const apiRunner: Optional<ApiRunner> = import.meta.env.SSR
    ? null
    : useServices().retrieve(serviceKeys.apiRunner);

  const permutation = shallowRef(Permutation.create(BASE, 1, 0));
  const expansion = shallowRef<OeisFractionalExpansion>();

  const selectedInterestingConstant =
    computed(() => interestingConstantsInfo.find(v => v.id.equals(expansion.value?.id)));

  function updatePermutation(newPermutation: Permutation) {
    if (newPermutation.equals(permutation.value)) {
      console.debug("state Permutation update canceled because of equality");
      return;
    }

    permutation.value = newPermutation;
  }

  const randomizePermutation = () => updatePermutation(Permutation.createRandom(BASE));
  const reversePermutation = () => updatePermutation(permutation.value.reverse());
  const reflectPermutation = () => updatePermutation(permutation.value.reflect());
  const invertPermutation = () => updatePermutation(permutation.value.invert());

  function startApiWarmUp() {
    if (!apiRunner) {
      return;
    }

    apiRunner.startWarmUp();
  }

  async function getExpansionById(id: OeisId) {
    if (id.equals(expansion.value?.id)) {
      console.debug("state getExpansionById canceled because of OeisId equality");
      return;
    }

    if (!apiRunner) {
      return;
    }

    const expansionOrError = await apiRunner.getExpansionById(id);

    if (expansionOrError.left) {
      // TODO handle errors
      throw expansionOrError.left;
    }

    expansion.value = expansionOrError.right;
  }

  async function getRandomExpansion() {
    if (!apiRunner) {
      return;
    }

    const newExpansion = await apiRunner.getRandomExpansion();

    if (newExpansion.id.equals(expansion.value?.id)) {
      console.debug("state getRandomExpansion canceled because of OeisId equality");
      return;
    }

    expansion.value = newExpansion;
  }

  return {
    permutation: readonly(permutation),
    expansion: readonly(expansion),
    selectedInterestingConstant,
    updatePermutation,
    randomizePermutation,
    reversePermutation,
    reflectPermutation,
    invertPermutation,
    startApiWarmUp,
    getExpansionById,
    getRandomExpansion,
  };
});
