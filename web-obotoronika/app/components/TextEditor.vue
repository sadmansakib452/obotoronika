<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { ref, watch } from 'vue'

interface IProps {
  model: string | undefined
}
const props = withDefaults(defineProps<IProps>(), {
  model: '',
})
const emit = defineEmits(['update:model'])

let editorInstance: any = null
const editorContent = ref(props.model)

const onEditorReady = (editor: any) => {
  editorInstance = editor
  editorInstance.root.innerHTML = props.model
}

// Watch for external changes to `props.model`
watch(() => props.model, (newVal) => {
  if (editorInstance && editorInstance.root.innerHTML !== newVal) {
    editorInstance.root.innerHTML = newVal
  }
})

const handleTextChange = () => {
  if (editorInstance) {
    const content = editorInstance.root.innerHTML
    emit('update:model', content)
  }
}
</script>

<template>
  <div class="editor-wrapper">
    <ClientOnly>
      <QuillEditor
        v-model:content="editorContent"
        theme="snow"
        toolbar="minimal"
        @ready="onEditorReady"
        @text-change="handleTextChange"
      />
    </ClientOnly>
  </div>
</template>

<style scoped lang="css">
.editor-wrapper {
    @apply rounded-md border transition-colors dark:border-theme-border dark:!bg-dark;
}

.editor-wrapper:focus-within {
    @apply border-primary outline-1;
}

:deep(.ql-editor) {
    @apply h-44 overflow-y-auto resize-y;
}

:deep(.ql-toolbar.ql-snow) {
    border-radius: 5px 5px 0 0;
    @apply border-t-0 border-r-0 border-l-0 border-[#e5e7eb] dark:border-theme-border;
}

:deep(.ql-container.ql-snow) {
    border-radius: 0 0 5px 5px;
    @apply border-0;
}
</style>
