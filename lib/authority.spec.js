const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const expect = chai.expect;

const edge = require('edge');
const createAuthorityConnector = require('./authority');
const testUtils = require('./test-utils');

describe('Authority Connector', () => {
  let authorityConnector;
  let fakeRecord;
  let fakeCatLocationId;
  let fakeOptions;
  let edgeFuncStub;
    
  beforeEach(() => {
    edgeFuncStub = sinon.stub();
    sinon.stub(edge, 'func').callsFake(() => edgeFuncStub);
    authorityConnector = createAuthorityConnector();
    fakeRecord = testUtils.fakeRecord();
    fakeCatLocationId = 94;
    fakeOptions = {
      iniDir: '',
      username: 'fake-username',
      password: 'fake-password'
    };
  });

  afterEach(() => {
    edge.func.restore();
  });


  it('should be a factory function', () => {
    expect(createAuthorityConnector).to.be.a('function');
  });
  
  describe('addAuthorityRecord', () => {
  
    it('should reject with an error if mandatory parameters are missing', () => {
      return authorityConnector.addRecord(fakeRecord, fakeCatLocationId, {})
        .catch(error => {
          expect(error.message).to.contain('The following options are mandatory');
        });
    });
    
    it('should call the AddAuthorityRecord using edge', () => {
      
      edgeFuncStub.returns({ recordId: 33 });
    
      return authorityConnector.addRecord(fakeRecord, fakeCatLocationId, fakeOptions)
        .then(result => {
          expect(result).to.equal(33);
          expect(edge.func).to.have.been.called;
          const edgeOptions = edge.func.getCall(0).args[0];
          expect(edgeOptions.methodName).to.equal('AddAuthorityRecord');
        });

    });

    it('should reject with error if action fails', () => {
      const fakeError = { message: 'fake-error-message', code: 'fakeErrorCode' };
      edgeFuncStub.returns({ error: fakeError });

      return authorityConnector.addRecord(fakeRecord, fakeCatLocationId, fakeOptions)
        .catch(error => {
          expect(error).to.be.instanceof(Error);
          expect(error.message).to.exist;
          expect(error.errorCode).to.exist;
          expect(edge.func).to.have.been.called;
        });
      
    });
  });

  describe('updateAuthorityRecord', () => {

    const fakeRecordId = 33;
  
    it('should reject with an error if mandatory parameters are missing', () => {
      return authorityConnector.updateRecord(fakeRecordId, fakeRecord, fakeCatLocationId, {})
        .catch(error => {
          expect(error.message).to.contain('The following options are mandatory');
        });
    });
    
    it('should call the updateAuthorityRecord using edge', () => {
      
      edgeFuncStub.returns();
    
      return authorityConnector.updateRecord(fakeRecordId, fakeRecord, fakeCatLocationId, fakeOptions)
        .then(() => {
          expect(edge.func).to.have.been.called;
          const edgeOptions = edge.func.getCall(0).args[0];
          expect(edgeOptions.methodName).to.equal('UpdateAuthorityRecord');
        });

    });

    it('should reject with error if action fails', () => {
      const fakeError = { message: 'fake-error-message', code: 'fakeErrorCode' };
      edgeFuncStub.returns({ error: fakeError });

      return authorityConnector.updateRecord(fakeRecordId, fakeRecord, fakeCatLocationId, fakeOptions)
        .catch(error => {
          expect(error).to.be.instanceof(Error);
          expect(error.message).to.exist;
          expect(error.errorCode).to.exist;
          expect(edge.func).to.have.been.called;
        });
      
    });

    it('should reject with error if the 005 field is not valid', () => {
      const fakeError = { message: 'fake-error-message', code: 'fakeErrorCode' };
      edgeFuncStub.returns({ error: fakeError });

      fakeRecord.getControlfields()
        .filter(field => field.tag === '005')
        .forEach(field => field.value = 'invalid-data');
        
      return authorityConnector.updateRecord(fakeRecordId, fakeRecord, fakeCatLocationId, fakeOptions)
        .catch(error => {
          expect(error).to.be.instanceof(Error);
          expect(error.message).to.exist;
          expect(edge.func).not.to.have.been.called;
        });
      
    });
  });


  describe('deleteAuthorityRecord', () => {

    const fakeRecordId = 33;
  
    it('should reject with an error if mandatory parameters are missing', () => {
      return authorityConnector.deleteRecord(fakeRecordId, {})
        .catch(error => {
          expect(error.message).to.contain('The following options are mandatory');
        });
    });
    
    it('should call the DeleteAuthorityRecord using edge', () => {
      
      edgeFuncStub.returns();
    
      return authorityConnector.deleteRecord(fakeRecordId, fakeOptions)
        .then(() => {
          expect(edge.func).to.have.been.called;
          const edgeOptions = edge.func.getCall(0).args[0];
          expect(edgeOptions.methodName).to.equal('DeleteAuthorityRecord');
        });

    });

    it('should reject with error if action fails', () => {
      const fakeError = { message: 'fake-error-message', code: 'fakeErrorCode' };
      edgeFuncStub.returns({ error: fakeError });

      return authorityConnector.deleteRecord(fakeRecordId, fakeOptions)
        .catch(error => {
          expect(error).to.be.instanceof(Error);
          expect(error.message).to.exist;
          expect(error.errorCode).to.exist;
          expect(edge.func).to.have.been.called;
        });
      
    });

  });
});
