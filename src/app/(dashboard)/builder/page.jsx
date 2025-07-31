'use client'

import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import SectionBlock from '@/components/SectionBlock'
import FieldItem from '@/components/FieldItem'

const fieldOptions = [
  'Single Line', 'Multi-Line', 'Email', 'Phone',
  'Pick List', 'Multi-Select', 'Date', 'Number',
  'Currency', 'Checkbox', 'URL', 'Formula',
  'User', 'File Upload', 'Image Upload', 'Section Divider'
]

export default function BuilderPage() {
  const [sections, setSections] = useState([])
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)

  const handleDropField = (sectionIndex, column, type) => {
    const updated = [...sections]
    updated[sectionIndex].fields[column].push({
      id: crypto.randomUUID(),
      type,
      label: type,
      placeholder: '',
      required: false
    })

     // 👇 Add this block here:
  if (type === 'Pick List') {
    updated.options = ['Option 1', 'Option 2']
  }

  if (type === 'Phone') {
    updated.maxLength = 10
  }
    setSections(updated)
  }

  const handleUpdateSection = (sectionIndex, updatedSection) => {
    const updated = [...sections]
    updated[sectionIndex] = updatedSection
    setSections(updated)
  }

  const handleSave = () => {
    console.log('Saved JSON:', JSON.stringify(sections, null, 2))
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='flex gap-6 p-6'>
        <div className='w-[220px] bg-slate-900 text-white rounded p-4 space-y-2'>
          <h2 className='text-lg font-semibold mb-2'>New Fields</h2>
          {fieldOptions.map((type, i) => (
            <FieldItem key={i} type={type} isPreview />
          ))}
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
          <button
            onClick={handleSave}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded'
          >
            Save as JSON
          </button>
        </div>
      </div>
    </DndProvider>
  )
}
