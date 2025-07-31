'use client'

import { useDrop } from 'react-dnd'
import FieldItem from './FieldItem'

export default function SectionBlock({ section, index, onDropField, onUpdateSection }) {
  const [, dropLeft] = useDrop(() => ({
    accept: 'FIELD',
    drop: (item) => {
      if (item.index === undefined) onDropField(index, 'left', item.type)
    }
  }), [index])

  const [, dropRight] = useDrop(() => ({
    accept: 'FIELD',
    drop: (item) => {
      if (item.index === undefined) onDropField(index, 'right', item.type)
    }
  }), [index])

  const updateField = (col, fieldIndex, updatedField) => {
    const updatedFields = { ...section.fields }
    updatedFields[col][fieldIndex] = updatedField
    const updatedSection = { ...section, fields: updatedFields }
    onUpdateSection(index, updatedSection)
  }

  const deleteField = (col, fieldIndex) => {
    const updatedFields = { ...section.fields }
    updatedFields[col] = updatedFields[col].filter((_, i) => i !== fieldIndex)
    const updatedSection = { ...section, fields: updatedFields }
    onUpdateSection(index, updatedSection)
  }

  return (
    <div className='p-4 mb-6 border border-dashed rounded bg-gray-50'>
      <input
        value={section.title}
        onChange={(e) => onUpdateSection(index, { ...section, title: e.target.value })}
        className='font-semibold text-md mb-4 px-2 py-1 border rounded w-full bg-white'
      />

      {section.layout === 'double' ? (
        <div className='grid grid-cols-2 gap-4'>
          <div ref={dropLeft} className='min-h-[200px] bg-white border p-2 rounded'>
            {section.fields.left.map((field, i) => (
              <FieldItem key={field.id} type={field.type} field={field} index={i}
                onUpdate={(i, updated) => updateField('left', i, updated)}
                onDelete={(i) => deleteField('left', i)}
              />
            ))}
            <p className='text-xs text-gray-400 text-center mt-2'>Drop fields here</p>
          </div>
          <div ref={dropRight} className='min-h-[200px] bg-white border p-2 rounded'>
            {section.fields.right.map((field, i) => (
              <FieldItem key={field.id} type={field.type} field={field} index={i}
                onUpdate={(i, updated) => updateField('right', i, updated)}
                onDelete={(i) => deleteField('right', i)}
              />
            ))}
            <p className='text-xs text-gray-400 text-center mt-2'>Drop fields here</p>
          </div>
        </div>
      ) : (
        <div ref={dropLeft} className='min-h-[200px] bg-white border p-2 rounded'>
          {section.fields.left.map((field, i) => (
            <FieldItem key={field.id} type={field.type} field={field} index={i}
              onUpdate={(i, updated) => updateField('left', i, updated)}
              onDelete={(i) => deleteField('left', i)}
            />
          ))}
          <p className='text-xs text-gray-400 text-center mt-2'>Drop fields here</p>
        </div>
      )}
    </div>
  )
}
