<template>
    <v-btn @click="generatePDF" :disabled="!mobile">Download PDF</v-btn>
  </template>
  
  <script>
  import { jsPDF } from 'jspdf'
  import html2canvas from 'html2canvas'
  import 'jspdf-autotable'
  
  export default {
    name: 'PDFBuilder',
    props: {
      pdfElementId: {
        type: String,
        required: true,
        default: 'pdf-generator'
      },
      mobile: {
        type: Boolean,
        required: false,
        default: true
      }
    },
    methods: {
      async generatePDF() {
        const element = document.getElementById(this.pdfElementId)
        if (!element) {
          console.error(`No element found with id="${this.pdfElementId}"`)
          return
        }
  
        try {
          // 1. Render HTML to canvas
          const canvas = await html2canvas(element, {
            // optional settings for better resolution or ignoring certain elements
            scale: 2
          })
          const imgData = canvas.toDataURL('image/png')
  
          // 2. Create PDF
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: 'letter',
            hotfixes: ['px_scaling'],
            putOnlyUsedFonts: true
          })
  
          // 3. Determine image dims vs PDF dims
          const pdfWidth = pdf.internal.pageSize.getWidth()
          const pdfHeight = pdf.internal.pageSize.getHeight()
  
          // Let’s make the image fit width
          // The ratio is important to keep the bracket from being squashed
          const imgWidth = canvas.width
          const imgHeight = canvas.height
          const ratio = imgHeight / imgWidth
          const newImgWidth = pdfWidth
          const newImgHeight = pdfWidth * ratio
  
          // If the bracket is tall and could spill multiple pages
          // you can do advanced multi-page logic, or try to shrink further:
          if (newImgHeight <= pdfHeight) {
            // Single page
            pdf.addImage(imgData, 'PNG', 0, 0, newImgWidth, newImgHeight)
          } else {
            // Possibly split across multiple pages or just scale to fit
            // For simplicity, scale to fit one page:
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
          }
  
          // 4. Save
          pdf.save('bracket.pdf')
        } catch (error) {
          console.error('Error generating PDF:', error)
        }
      }
    }
  }
  </script>