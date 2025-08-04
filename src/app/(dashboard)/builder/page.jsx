'use client'

import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import SectionBlock from '@/components/SectionBlock'
import FieldItem from '@/components/FieldItem'
import { Button } from '@mui/material'
import PreviewModal from '@/components/PreviewRenderer'

const fieldOptions = [
  'Single Line',
  'Multi-Line',
  'Email',
  'Phone',
  'Pick List',
  'Multi-Select',
  'Date',
  'Date Time',
  'Number',
  'Auto-Number',
  'Currency',
  'Decimal',
  'User',
  'Checkbox',
  'URL',
  // 'Formula',
  'File Upload',
  'Image Upload',
  'Section Divider'
]

export default function BuilderPage() {
  const [sections, setSections] = useState([])
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const [open, setOpen] = useState(false)
  const removeField = () => {
    console.log('removeField')
  }
  const handleMakeRequired = () => {
    console.log('handleMakeRequired')
  }
  const handleSetPermission = () => {
    console.log('handleSetPermission')
  }

  const handleDropField = (sectionIndex, column, type) => {
    const updated = [...sections]

    const newField = {
      id: crypto.randomUUID(),
      type,
      label: type,
      placeholder: '',
      required: false
    }

    if (type === 'Single Line') {
      newField.maxChars = 255
      newField.allowDuplicate = true
      newField.isPublic = false
      newField.isEncrypted = false
      newField.isExternal = false
      newField.showTooltip = false
      newField.createFor = [] // [ 'Account', 'Contact', 'Deal' ]
    }
    if (type === 'Multi-Line') {
      newField.subType = 'plain-small'
      newField.isPublic = false
      newField.isEncrypted = false
      newField.showTooltip = false
      newField.createFor = []
    }
    if (type === 'Email') {
      newField.isPublic = false
      newField.isEncrypted = false
      newField.required = false
      newField.noDuplicates = false
      newField.showTooltip = false
      newField.createFor = []
    }
    if (type === 'Phone') {
      newField.maxLength = 30
      newField.isPublic = false
      newField.required = false
      newField.noDuplicates = false
      newField.isEncrypted = false
      newField.showTooltip = false
      newField.tooltipMessage = ''
      newField.tooltipType = 'icon' // or 'static'
      newField.createFor = []
    }

    if (type === 'Pick List') {
      newField.options = ['Option 1', 'Option 2']
      newField.defaultValue = ''
      newField.sortOrder = 'entered' // or 'alphabetical'
      newField.trackHistory = false
      newField.enableColor = false
      newField.isPublic = false
      newField.required = false
      newField.showTooltip = false
      newField.tooltipMessage = ''
      newField.tooltipType = 'icon'
      newField.createFor = []
    }

    if (type === 'Multi-Select') {
      newField.options = ['Option 1', 'Option 2']
      newField.defaultValue = [] // multiple values
      newField.sortOrder = 'entered' // or 'alphabetical'
      newField.isPublic = false
      newField.required = false
      newField.showTooltip = false
      newField.tooltipMessage = ''
      newField.tooltipType = 'icon'
      newField.createFor = []
    }
    if (type === 'Date') {
      newField.isPublic = false
      newField.isEncrypted = false
      newField.required = false
      newField.noDuplicates = false
      newField.showTooltip = false
      newField.createFor = []
    }
    if (type === 'Date Time') {
      newField.isPublic = false
      newField.isEncrypted = false
      newField.required = false
      newField.noDuplicates = false
      newField.showTooltip = false
      newField.createFor = []
    }

    if (type === 'Number') {
      newField.maxDigits = ''
      newField.useSeparator = false
    }
    if (type === 'Checkbox') {
      newField.defaultChecked = false
      newField.placeholder = 'Checkbox Label'
    }
    if (type === 'Currency') {
      newField.maxDigits = ''
      newField.decimalPlaces = '2'
      newField.rounding = 'normal'
    }

    // ✅ Safely create the column array if it's missing
    if (!updated[sectionIndex].fields[column]) {
      updated[sectionIndex].fields[column] = []
    }

    updated[sectionIndex].fields[column].push(newField)

    setSections(updated)
  }

  const handleUpdateSection = (sectionIndex, updatedSection) => {
    const updated = [...sections]
    updated[sectionIndex] = updatedSection
    setSections(updated)
  }

  const handleSave = () => {
    // console.log('Saved JSON:', JSON.stringify(sections, null, 2))
    console.log('Saved JSON:', sections)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='flex gap-6 p-6'>
        <div className='w-[220px] bg-slate-900 text-white rounded p-4 space-y-2'>
          <h2 className='text-lg font-semibold mb-2'>New Fields</h2>
          <button
            onClick={() => setShowLayoutPicker(true)}
            className='w-full mt-4 py-2 bg-white text-black rounded text-sm font-medium'
          >
            ➕ New Section
          </button>
          {showLayoutPicker && (
            <div className='mt-2 space-y-2'>
              <button
                className='w-full px-3 py-2 bg-gray-200 rounded text-sm'
                onClick={() => {
                  setSections(prev => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      title: 'New Section',
                      layout: 'single',
                      fields: { left: [] }
                    }
                  ])
                  setShowLayoutPicker(false)
                }}
              >
                🟦 Single Column Section
              </button>
              <button
                className='w-full px-3 py-2 bg-gray-200 rounded text-sm'
                onClick={() => {
                  setSections(prev => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      title: 'New Section',
                      layout: 'double',
                      fields: { left: [], right: [] }
                    }
                  ])
                  setShowLayoutPicker(false)
                }}
              >
                🟨 Two Column Section
              </button>
            </div>
          )}

          {fieldOptions.map((type, i) => (
            <FieldItem
              key={i}
              type={type}
              isPreview
              removeField={removeField}
              handleMakeRequired={handleMakeRequired}
              handleSetPermission={handleSetPermission}
            />
          ))}
        </div>

        <div className='flex-1'>
          {sections.map((section, index) => (
            <SectionBlock
              key={section.id}
              section={section}
              index={index}
              onDropField={handleDropField}
              onUpdateSection={handleUpdateSection}
            />
          ))}
          <Button onClick={handleSave} variant='contained'>
            Save
          </Button>
          <Button variant='contained' color="success" onClick={() => setOpen(true)}>
            Preview 
          </Button>
          <PreviewModal open={open} onClose={() => setOpen(false)} sections={sections} />
        </div>
      </div>
    </DndProvider>
  )
}
