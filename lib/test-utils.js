const MarcRecord = require('marc-record-js');

const fakeRecord = () => MarcRecord.fromString(`
LDR    00878cam a2200253 i 4500
001    12356
005    20110826153059.0
008    760910s1975    dcu      b   f000 0 eng  
092    ‡a378.73 U58L
`.trim());

module.exports = {
  fakeRecord
};
