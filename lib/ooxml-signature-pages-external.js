module.exports = ooxmlSignaturePagesExternal

// OOXML Paragraph
function p (content) {
  return '<w:p>' + content + '</w:p>'
}

// OOXML Paragraph Properties
function pPr (content) {
  return '<w:pPr>' + content + '</w:pPr>'
}

// OOXML Run
function run (content) {
  return '<w:r>' + content + '</w:r>'
}

// OOXML Text
function t (text) {
  return '<w:t xml:space="preserve">' + text + '</w:t>'
}

// [Document ends here.], centered
const DOCUMENT_ENDS_HERE = p(
  pPr('<w:jc w:val="center" />') +
  run(t('[Document ends here.]'))
)

// [Signature pages follow.], centered
const PAGES_FOLLOW = p(
  pPr('<w:jc w:val="center" />') +
  run(t('[Signature pages follow.]'))
)

// [Signature page follows.], centered
const PAGE_FOLLOWS = p(
  pPr('<w:jc w:val="center" />') +
  run(t('[Signature page follows.]'))
)

const SIGNATURE_BLOCK = p(
  pPr('<w:jc w:val="left" />') +
  run(t('{{ signatureblock }}'))
)

function ooxmlSignaturePagesExternal (signatureCount) {
  return (
    (
      (signatureCount === 0)
        ? DOCUMENT_ENDS_HERE
        : (signatureCount === 1)
          ? PAGE_FOLLOWS +
            SIGNATURE_BLOCK
          : PAGES_FOLLOW +
            SIGNATURE_BLOCK
    )
  )
}
