'use client'

import { useDrag } from 'react-dnd'
import { useRef } from 'react'
import FieldCard from './FieldCard'

export default function FieldItem({ type, field, index, onUpdate, onDelete, isPreview, removeField, handleMakeRequired, handleSetPermission }) {
  const ref = useRef(null)


  const [, drag] = useDrag(
    () => ({
      type: 'FIELD',
      item: { type, index }
    }),
    [type]
  )

  drag(ref)

  if (isPreview) {
    return (
      <div ref={ref} className='bg-slate-800 p-2 rounded cursor-move text-sm text-white'>
        {type}
      </div>
    )
  }

  if (type === 'Section Divider') {
    return (
      <div ref={ref} className='p-2 bg-gray-200 rounded shadow mb-2'>
        <div className='text-center border-t border-gray-400 relative'>
          <input
            className='absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-200 px-2 text-sm text-gray-700'
            value={field.label}
            onChange={e => onUpdate(index, { ...field, label: e.target.value })}
            placeholder='Section Label'
          />
        </div>
        <button onClick={() => onDelete(index)} className='text-red-500 text-xs mt-1 block text-center w-full'>
          Delete
        </button>
      </div>
    )
  }

  const handlePicklistChange = (i, value) => {
    const updatedOptions = [...(field.options || [])]
    updatedOptions[i] = value
    onUpdate(index, { ...field, options: updatedOptions })
  }

  const handleAddOption = () => {
    const updatedOptions = [...(field.options || []), '']
    onUpdate(index, { ...field, options: updatedOptions })
  }

  const handleDeleteOption = i => {
    const updatedOptions = field.options.filter((_, idx) => idx !== i)
    onUpdate(index, { ...field, options: updatedOptions })
  }

  return (
    <div ref={ref} className='p-4 bg-white rounded shadow mb-2 space-y-2 border'>
      <div className='flex justify-between items-center gap-2'>
        <input
          className='border p-1 text-sm w-2/3'
          value={field.label}
          onChange={e => onUpdate(index, { ...field, label: e.target.value })}
          placeholder='Label'
        />
        <span className='text-xs text-gray-500 italic w-1/3 text-right'>{type}</span>
      </div>

      <FieldCard
        field={field}
        index={index}
        onUpdate={onUpdate}
        onDelete={onDelete}
        removeField={removeField}
        handleMakeRequired={handleMakeRequired}
        handleSetPermission={handleSetPermission}
      />

     

      <div className='flex justify-between items-center'>
        {/* <label className='flex items-center gap-2 text-sm'>
          <input
            type='checkbox'
            checked={field.required}
            onChange={e => onUpdate(index, { ...field, required: e.target.checked })}
          />
          Required
        </label> */}
        {/* <button onClick={() => onDelete(index)} className='text-red-500 text-xs'>
          Delete
        </button> */}
      </div>
    </div>
  )
}
