<!-- eslint-disable @typescript-eslint/no-dynamic-delete -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'
import { GripVertical, Plus } from 'lucide-vue-next'
import hexToRgba from '@/utils/hexToRgba'
import { UBadge, UButton, UFormGroup, USelectMenu } from '#components'

const props = defineProps({
  items: Array<any>,
})

const emit = defineEmits(['getVariants'])
const variantStore = useVariantStore()

const selectedOptions = ref<
  {
    key: string
    values: { id: number, label: string, value: string }[]
  }[]
>([])

const doneOptions = ref<Record<number, boolean>>({})

const addOption = () => {
  selectedOptions.value.push({ key: '', values: [] })
}

const addValueInput = (optionIndex: number) => {
  selectedOptions.value[optionIndex]?.values.push({
    id: Date.now(),
    label: '',
    value: '',
  })
}

const removeValue = (optionIndex: number, valueIndex: number) => {
  selectedOptions.value[optionIndex]?.values.splice(valueIndex, 1)
}

const getAvailableOptions = (currentIndex: number) => {
  return variantStore.product_variants.variants.map((variant: any) => ({
    label: variant.name,
    value: variant.key,
    disabled: selectedOptions.value.some(
      (s, idx) => s.key === variant.key && idx !== currentIndex,
    ),
  }))
}

const getVariantOptions = (key: string) => {
  const { options } = variantStore.product_variants
  return Array.isArray(options?.[key]) ? options[key] : []
}

const hasAvailableOptions = computed(() => {
  return variantStore.product_variants.variants.some(
    (opt: any) => !selectedOptions.value.some(s => s.key === opt.key),
  )
})

const allOptionsValid = computed(() => {
  return selectedOptions.value.every(option => option.key !== '')
})

const formattedOptions = computed(() =>
  selectedOptions.value.map(entry => ({
    [entry.key]: entry.values.filter(v => v && v.value),
  })),
)

const toggleDoneState = (index: number) => {
  doneOptions.value[index] = !doneOptions.value[index]
  emit('getVariants', formattedOptions.value)
}

const removeOption = (index: number) => {
  selectedOptions.value.splice(index, 1)
  delete doneOptions.value[index]
  toggleDoneState(index)
}

onMounted(async () => {
  await variantStore.getProductVariants()
  if (props.items) {
    try {
      selectedOptions.value = props.items.map((entry: any, index: number) => {
        const key = Object.keys(entry)[0] as string
        const values = entry[key].map((v: any) => ({
          id: v.id,
          label: v.label,
          value: v.value,
        }))
        doneOptions.value[index] = true
        return { key, values }
      })
    }
    catch (e) {
      console.error('Invalid items JSON', e)
    }
  }
})
</script>

<template>
  <div>
    <!-- Add Option Button -->
    <UButton
      v-if="selectedOptions.length === 0"
      type="button"
      size="xs"
      variant="outline"
      @click="addOption"
    >
      <Plus :size="20" /> Add options like size or color.
    </UButton>

    <!-- Draggable Option List -->
    <draggable
      v-model="selectedOptions"
      handle=".drag-handle"
      item-key="key"
      class="grid grid-cols-2 gap-4"
    >
      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <template #item="{ element, index }">
        <div class="border p-4 rounded-md bg-gray-50 relative">
          <!-- Edit Mode -->
          <template v-if="!doneOptions[index]">
            <div class="flex gap-2 items-center">
              <button class="cursor-move mt-6 drag-handle">
                <GripVertical :size="20" class="obotoronika-muted-text" />
              </button>

              <!-- Option Selector -->
              <UFormGroup label="Select Option" name="options" class="w-full">
                <!-- @vue-ignore -->
                <USelectMenu
                  v-model="selectedOptions[index].key"
                  option-attribute="label"
                  value-attribute="value"
                  :options="getAvailableOptions(index)"
                  placeholder="Select Option"
                  class="w-full"
                  @change="() => addValueInput(index)"
                />
              </UFormGroup>
            </div>
            <!-- Option Values Input -->
            <UFormGroup
              label="Option Values"
              name="optionValues"
              class="ml-12 mt-4"
            >
              <!-- @vue-ignore -->
              <div
                v-for="(value, valueIndex) in selectedOptions[index].values"
                :key="valueIndex"
                class="flex gap-2 items-center"
              >
                <!-- In this part got error in second when i'm second variant (shared.js:37  Uncaught (in promise) TypeError: Cannot read properties of null (reading 'startsWith')) -->
                <USelectMenu
                  v-model="selectedOptions[index].values[valueIndex].value"
                  :options="getVariantOptions(selectedOptions[index].key)"
                  searchable
                  option-attribute="label"
                  value-attribute="value"
                  class="w-full"
                  @update:model-value="
                    (val) => {
                      const option = getVariantOptions(
                        selectedOptions[index].key,
                      ).find((opt) => opt.value === val);
                      if (option) {
                        selectedOptions[index].values[valueIndex] = {
                          id: option.id,
                          label: option.label,
                          value: option.value,
                        };
                      }
                    }
                  "
                >
                  <template
                    v-if="selectedOptions[index].key.includes('color.')"
                    #leading
                  >
                    <span
                      v-if="selectedOptions[index].key?.includes('color')"
                      :key="selectedOptions[index]?.values[valueIndex]?.id"
                      class="block w-2 h-2 rounded-full"
                      :style="{
                        backgroundColor:
                          selectedOptions[index]?.values[valueIndex]?.value,
                      }"
                    />
                  </template>
                  <template
                    v-if="selectedOptions[index].key.includes('color.')"
                    #option="{ option: item }"
                  >
                    <span
                      v-if="selectedOptions[index].key?.includes('color')"
                      :key="item.id"
                      class="block w-2 h-2 rounded-full"
                      :style="{ backgroundColor: item.value }"
                    />
                    <span class="truncate">{{ item.label }}</span>
                  </template>
                </USelectMenu>
                <UButton
                  color="red"
                  variant="link"
                  icon="i-heroicons-trash"
                  size="xs"
                  type="button"
                  @click="removeValue(index, valueIndex)"
                />
              </div>
              <UButton
                type="button"
                size="xs"
                variant="outline"
                class="mt-2"
                @click="addValueInput(index)"
              >
                <Plus :size="16" /> Add another value
              </UButton>
            </UFormGroup>
            <div class="w-fit ml-auto mt-8 flex gap-2">
              <UButton
                color="red"
                size="xs"
                variant="outline"
                icon="i-heroicons-trash"
                type="button"
                @click="removeOption(index)"
              >
                Delete
              </UButton>
              <UButton
                :disabled="!selectedOptions[index]?.key"
                color="black"
                size="xs"
                icon="i-heroicons-check"
                type="button"
                @click="toggleDoneState(index)"
              >
                Done
              </UButton>
            </div>
          </template>

          <!-- Done Mode (Summary View) -->
          <template v-else>
            <div class="flex justify-between items-center">
              <div class="flex gap-2 items-center">
                <button class="cursor-move drag-handle">
                  <GripVertical :size="20" class="obotoronika-muted-text" />
                </button>
                <h3 class="font-medium text-lg capitalize">
                  <!-- @vue-ignore -->
                  {{
                    variantStore.product_variants.variants.find(
                      (opt) => opt.key === selectedOptions[index].key,
                    )?.name || selectedOptions[index].key
                  }}
                </h3>
              </div>
              <UButton
                color="gray"
                size="xs"
                variant="ghost"
                icon="i-heroicons-pencil"
                type="button"
                @click="toggleDoneState(index)"
              >
                Edit
              </UButton>
            </div>
            <div class="mt-2">
              <div class="flex flex-wrap gap-1">
                <!-- @vue-ignore -->
                <div
                  v-for="(item, valueIndex) in selectedOptions[
                    index
                  ].values.filter(Boolean)"
                  :key="valueIndex"
                >
                  <div
                    v-if="selectedOptions[index].key.includes('color.')"
                    class="flex gap-1 items-center text-xs px-1.5 py-0.5 rounded-full font-medium"
                    :style="{ backgroundColor: hexToRgba(item.value, 0.1) }"
                  >
                    <span
                      class="block w-2 h-2 rounded-full"
                      :style="{ backgroundColor: item.value }"
                    />
                    <span>{{ item.label }}</span>
                  </div>
                  <div v-else class="flex flex-wrap gap-1">
                    <UBadge
                      :key="valueIndex"
                      :label="item.value"
                      variant="soft"
                      class="uppercase"
                      size="xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>
    </draggable>

    <!-- Add Another Option Button -->
    <UButton
      v-if="hasAvailableOptions && selectedOptions.length"
      :disabled="!allOptionsValid || !hasAvailableOptions"
      type="button"
      size="xs"
      variant="outline"
      class="mt-4"
      @click="addOption"
    >
      <Plus :size="20" /> Add another option
    </UButton>
  </div>
</template>
