import React from 'react';
import PropTypes from 'prop-types';

const EntregasPDFTemplate = React.forwardRef(({ data }, ref) => {
  return (
    <div ref={ref} style={{ backgroundColor: 'white' }}>
      {/* Header: logo and title */}
      <div className="page-header" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
          <img 
            src="/logos/logo.png" 
            alt="AndesBPO" 
            style={{ height: '56px', marginRight: 'calc(40px + 12%)' }} 
          />
        </div>
        <h1 style={{ 
          width: '100%', 
          textAlign: 'center', 
          fontSize: '18px', 
          margin: '6px 0 0 0', 
          fontWeight: '700' 
        }}>
          FORMATO ENTREGA CAMPAÑAS
        </h1>
      </div>

      <div className="table-wrap" style={{ maxWidth: '900px', margin: '40px auto' }}>
        {/* Client Info Table */}
        <table 
          className="client-table" 
          role="table" 
          aria-label="Datos del cliente"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed'
          }}
        >
          <tbody>
            <tr>
              <td className="label" style={{
                width: '40%',
                fontWeight: 700,
                background: '#f3f3f3',
                border: '1px solid #444',
                padding: '10px 12px',
                verticalAlign: 'middle'
              }}>
                NOMBRE DEL CLIENTE
              </td>
              <td className="value" style={{
                textAlign: 'center',
                border: '1px solid #444',
                padding: '10px 12px',
                verticalAlign: 'middle'
              }}>
                {data?.nombreCliente || ''}
              </td>
            </tr>
            <tr>
              <td className="label" style={{
                width: '40%',
                fontWeight: 700,
                background: '#f3f3f3',
                border: '1px solid #444',
                padding: '10px 12px',
                verticalAlign: 'middle'
              }}>
                TIPO DE SERVICIO
              </td>
              <td className="value" style={{
                textAlign: 'center',
                border: '1px solid #444',
                padding: '10px 12px',
                verticalAlign: 'middle'
              }}>
                {data?.tipoServicio || ''}
              </td>
            </tr>
            <tr>
              <td className="label" style={{
                width: '40%',
                fontWeight: 700,
                background: '#f3f3f3',
                border: '1px solid #444',
                padding: '10px 12px',
                verticalAlign: 'middle'
              }}>
                FECHA DE INICIO SERVICIO
              </td>
              <td className="value" style={{
                textAlign: 'center',
                border: '1px solid #444',
                padding: '10px 12px',
                verticalAlign: 'middle'
              }}>
                {data?.fechaInicio || ''}
              </td>
            </tr>
            <tr>
              <td className="label" style={{
                width: '40%',
                fontWeight: 700,
                background: '#f3f3f3',
                border: '1px solid #444',
                padding: '10px 12px',
                verticalAlign: 'middle'
              }}>
                FECHA DE ENTREGA
              </td>
              <td className="value" style={{
                textAlign: 'center',
                border: '1px solid #444',
                padding: '10px 12px',
                verticalAlign: 'middle'
              }}>
                {data?.fechaEntrega || ''}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Three Column Table */}
        <table 
          className="three-col-table" 
          role="table" 
          aria-label="Fila 3 columnas" 
          style={{ 
            marginTop: '18px', 
            width: '100%', 
            tableLayout: 'fixed',
            borderCollapse: 'collapse'
          }}
        >
          <tbody>
            <tr className="header-row">
              <td className="col1" style={{
                width: '14%',
                background: '#000',
                color: '#fff',
                fontWeight: 700,
                textAlign: 'center',
                padding: '8px 10px',
                border: '1px solid #444'
              }}>
                PROCESO
              </td>
              <td className="col2" style={{
                width: '60%',
                background: '#000',
                color: '#fff',
                fontWeight: 700,
                textAlign: 'center',
                padding: '8px 10px',
                border: '1px solid #444'
              }}>
                CONCEPTO
              </td>
              <td className="col3" style={{
                width: '26%',
                background: '#000',
                color: '#fff',
                fontWeight: 700,
                textAlign: 'center',
                padding: '8px 10px',
                border: '1px solid #444'
              }}>
                OBSERVACION
              </td>
            </tr>

            {/* CONTRACTUAL Section */}
            <tr>
              <td className="col1" rowSpan="8" style={{
                verticalAlign: 'top',
                padding: '8px 10px',
                border: '1px solid #444'
              }}>
                CONTRACTUAL
              </td>
              <td className="col2" style={{
                verticalAlign: 'top',
                padding: '10px 12px',
                border: '1px solid #444'
              }}>
                Contrato
              </td>
              <td className="col3" style={{
                verticalAlign: 'top',
                padding: '8px 10px',
                border: '1px solid #444'
              }}>
                {data?.contractual?.contrato || ''}
              </td>
            </tr>
            {/* Add remaining CONTRACTUAL rows */}
            {/* ... Similar structure for other rows ... */}

            {/* TECNOLOGIA Section */}
            <tr>
              <td className="col1" rowSpan="14" style={{
                verticalAlign: 'top',
                padding: '8px 10px',
                border: '1px solid #444'
              }}>
                TECNOLOGIA
              </td>
              <td className="col2" style={{
                verticalAlign: 'top',
                padding: '10px 12px',
                border: '1px solid #444'
              }}>
                Mapa de Aplicativos a utilizarse
              </td>
              <td className="col3" style={{
                verticalAlign: 'top',
                padding: '8px 10px',
                border: '1px solid #444'
              }}>
                {data?.tecnologia?.mapaAplicativos || ''}
              </td>
            </tr>
            {/* Add remaining TECNOLOGIA rows */}
            {/* ... Similar structure for other rows ... */}

            {/* PROCESOS Section */}
            <tr>
              <td className="col1" rowSpan="2" style={{
                verticalAlign: 'top',
                padding: '8px 10px',
                border: '1px solid #444'
              }}>
                PROCESOS
              </td>
              <td className="col2" style={{
                verticalAlign: 'top',
                padding: '10px 12px',
                border: '1px solid #444'
              }}>
                Listado Reportes Esperados
              </td>
              <td className="col3" style={{
                verticalAlign: 'top',
                padding: '8px 10px',
                border: '1px solid #444'
              }}>
                {data?.procesos?.reportes || ''}
              </td>
            </tr>
            {/* Add remaining PROCESOS rows */}
          </tbody>
        </table>

        {/* Signature Fields */}
        <div style={{ marginTop: '70px' }}>
          {[
            'Ejecutivo Campaña',
            'Líder Campaña',
            'Auxiliar Administrativo',
            'Ejecutivo Comercial',
            'Líder Implementación'
          ].map((title, index) => (
            <div key={index} style={{ marginBottom: '45px' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '15px' }}>
                {title}
              </p>
              <div style={{ 
                borderBottom: '1px solid #000', 
                height: '70px', 
                width: '420px' 
              }}>
                &nbsp;
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

EntregasPDFTemplate.displayName = 'EntregasPDFTemplate';

EntregasPDFTemplate.propTypes = {
  data: PropTypes.shape({
    nombreCliente: PropTypes.string,
    tipoServicio: PropTypes.string,
    fechaInicio: PropTypes.string,
    fechaEntrega: PropTypes.string,
    contractual: PropTypes.object,
    tecnologia: PropTypes.object,
    procesos: PropTypes.object
  })
};

export default EntregasPDFTemplate;
