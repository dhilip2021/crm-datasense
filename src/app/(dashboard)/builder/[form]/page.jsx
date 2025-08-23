'use client'

import { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import SectionBlock from '@/components/SectionBlock'
import FieldItem from '@/components/FieldItem'
import { Box, Button } from '@mui/material'
import PreviewModal from '@/components/PreviewRenderer'
import { toast, ToastContainer } from 'react-toastify'
import Cookies from 'js-cookie'
import { useParams } from 'next/navigation'
import { LoadingButton } from '@mui/lab'

const fieldOptions = [
  'Single Line',
  'Multi-Line',
  'Email',
  'Phone',
  'Dropdown',
  'RadioButton',
  'Multi-Select',
  'Switch',
  'Date',
  'Date Time',
  'Number',
  'Auto-Number',
  'Currency',
  'Decimal',
  'User',
  'CheckBox',
  'URL',
  'File Upload',
  'Image Upload',
  'Section Divider'
]

export default function LeadFormPage() {
  const organization_id = Cookies.get('organization_id')
  const { form } = useParams()
  const lead_form = form

  const [sections, setSections] = useState([])
  const [formId, setFormId] = useState(null)
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const [open, setOpen] = useState(false)
  const [loader, setLoader] = useState(false)
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
      newField.minChars = 3
      newField.maxChars = 255
      newField.allowDuplicate = true
      newField.autoComplte = true
      newField.isPublic = false
      newField.allowSplCharacter = false
      newField.isEncrypted = false
      newField.isExternal = false
      newField.showTooltip = false
      newField.placeholder = 'Enter a value'
      newField.createFor = [] // [ 'Account', 'Contact', 'Deal' ]
    }
    if (type === 'Multi-Line') {
      newField.subType = 'plain-small'
      newField.rowSize = 3
      newField.autoComplte = true
      newField.isPublic = false
      newField.isEncrypted = false
      newField.showTooltip = false
      newField.createFor = []
      newField.placeholder = 'Enter a value'
    }
    if (type === 'Email') {
      newField.isPublic = false
      newField.isEncrypted = false
      newField.autoComplte = true
      newField.noDuplicates = false
      newField.showTooltip = false
      newField.createFor = []
      newField.placeholder = 'Enter a value'
    }
    if (type === 'Phone') {
      newField.maxLength = 10
      newField.isPublic = false
      newField.autoComplte = true
      newField.noDuplicates = false
      newField.isEncrypted = false
      newField.showTooltip = false
      newField.tooltipMessage = ''
      newField.countryCode = ''
      newField.tooltipType = 'icon'
      newField.createFor = []
      newField.placeholder = 'Enter a phone number'
    }

    if (type === 'Dropdown') {
      newField.options = ['Option 1', 'Option 2']
      newField.defaultValue = ''
      newField.sortOrder = 'entered' // or 'alphabetical'
      newField.trackHistory = false
      newField.enableColor = false
      newField.isPublic = false
      newField.showTooltip = false
      newField.tooltipMessage = ''
      newField.tooltipType = 'icon'
      newField.createFor = []
      newField.placeholder = 'Enter a value'
    }
    if (type === 'RadioButton') {
      newField.options = ['Option 1', 'Option 2']
      newField.defaultValue = ''
      newField.sortOrder = 'entered' // or 'alphabetical'
      newField.trackHistory = false
      newField.isPublic = false
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
      newField.showTooltip = false
      newField.tooltipMessage = ''
      newField.tooltipType = 'icon'
      newField.createFor = []
    }
    if (type === 'Date') {
      newField.isPublic = false
      newField.allowPastDate = false
      newField.isEncrypted = false
      newField.noDuplicates = false
      newField.showTooltip = false
      newField.createFor = []
      newField.placeholder = 'Enter a value'
    }
    if (type === 'Date Time') {
      newField.isPublic = false
      newField.allowPastDate = false
      newField.isEncrypted = false
      newField.noDuplicates = false
      newField.showTooltip = false
      newField.createFor = []
      newField.placeholder = 'Enter a value'
    }

    if (type === 'Number') {
      newField.minDigits = ''
      newField.maxDigits = ''
      newField.useSeparator = false
      newField.placeholder = 'Enter a value'
    }
    if (type === 'CheckBox') {
      newField.defaultChecked = false
      newField.placeholder = 'CheckBox Label'
    }
    if (type === 'Currency') {
      newField.minDigits = ''
      newField.maxDigits = ''
      newField.decimalPlaces = '2'
      newField.rounding = 'normal'
      newField.placeholder = 'Currency'
    }

    // ✅ Safely create the column array if it's missing
    if (!updated[sectionIndex].fields[column]) {
      updated[sectionIndex].fields[column] = []
    }
    updated[sectionIndex].fields[column].push(newField)
    setSections(updated)
  }

  const handleDeleteSection = sectionIndex => {
    const updated = [...sections]
    updated.splice(sectionIndex, 1)
    setSections(updated)
  }
  const handleUpdateSection = (sectionIndex, updatedSection) => {
    const updated = [...sections]
    updated[sectionIndex] = updatedSection
    setSections(updated)
  }

  const handleSaveLayout = async () => {
    const payload = {
      organization_id: organization_id,
      form_name: lead_form,
      version: 1,
      sections: sections
    }

    let res
    setLoader(true)

    if (formId) {
      // update existing
      res = await fetch('/api/v1/admin/lead-form-template/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, _id: formId })
      })
    } else {
      // create new
      res = await fetch('/api/v1/admin/lead-form-template/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    }

    const data = await res.json()

    if (data?.success) {
      setLoader(false)
      toast.success(formId ? 'Form updated successfully!' : 'Form saved successfully!')
      if (!formId) setFormId(data.data._id) // in case it's newly created
    } else {
      setLoader(false)
      toast.error('Form save/update failed!')
    }
  }

  const fetchFormByOrgAndName = async () => {
    const orgId = organization_id
    const formName = lead_form
    if (formName === 'lead-form') {
      const res = await fetch(`/api/v1/admin/lead-form-template/single?organization_id=${orgId}&form_name=${formName}`)
      const json = await res.json()
      if (json?.success) {
        if (json?.data?.sections?.length > 0) {
          setSections(json?.data?.sections)
          setFormId(json.data._id)
        }
      } else {
        setSections([])
        console.error('Error:', json.error)
        setFormId(null)
      }
    } else if (formName === 'customer-form') {
      const res = await fetch(
        `/api/v1/admin/customer-form-template/single?organization_id=${orgId}&form_name=${formName}`
      )
      const json = await res.json()
      if (json?.success) {
        if (json?.data?.sections?.length > 0) {
          setSections(json?.data?.sections)
          setFormId(json.data._id)
        }
      } else {
        setSections([])
        console.error('Error:', json.error)
        setFormId(null)
      }
    }
  }

  useEffect(() => {
    fetchFormByOrgAndName()
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='flex gap-6 p-6'>
        <div className='w-[220px] bg-slate-900 text-white rounded p-4 space-y-2 max-h-[85vh] overflow-y-auto'>
          <h2 className='text-lg font-semibold mb-2'>Lead Fields</h2>
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
              <button
                className='w-full px-3 py-2 bg-gray-200 rounded text-sm'
                onClick={() => {
                  setSections(prev => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      title: 'New Section',
                      layout: 'triple',
                      fields: { left: [], center: [], right: [] }
                    }
                  ])
                  setShowLayoutPicker(false)
                }}
              >
                🟥 Three Column Section
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
          <div className='max-h-[85vh] overflow-y-auto'>
            {sections.map((section, index) => (
              <>
                <button
                  onClick={() => handleDeleteSection(index)}
                  className='float-right right-6 cursor-pointer text-red-500 text-sm'
                >
                  ❌
                </button>
                <SectionBlock
                  key={section.id}
                  section={section}
                  index={index}
                  onDropField={handleDropField}
                  onUpdateSection={handleUpdateSection}
                  onDeleteSection={handleDeleteSection}
                />
              </>
            ))}
          </div>

          <Box display='flex' justifyContent={'space-between'} mt={2}>
            <Button variant='contained' color='success' onClick={() => setOpen(true)}>
              Preview
            </Button>
            {/* <Button onClick={handleSaveLayout} variant='contained' loadingPosition="start">
              {formId ? 'Update' : 'Save'}
            </Button> */}
            <LoadingButton
              onClick={handleSaveLayout}
              variant='contained'
              loading={loader} // ← this should be a state (true/false)
              loadingPosition='start'
            >
              {formId ? 'Update' : 'Save'}
            </LoadingButton>
          </Box>

          <PreviewModal open={open} onClose={() => setOpen(false)} sections={sections} />
        </div>
      </div>
      <ToastContainer />
    </DndProvider>
  )
}
