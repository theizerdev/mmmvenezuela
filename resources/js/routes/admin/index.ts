import monitoring from './monitoring'
import empresas from './empresas'
import estados from './estados'
import extensiones from './extensiones'
import iglesias from './iglesias'
import integrations from './integrations'
import municipios from './municipios'
import paises from './paises'
import parroquias from './parroquias'
import pastores from './pastores'
import roles from './roles'
import sucursales from './sucursales'
import usuarios from './usuarios'
const admin = {
    monitoring: Object.assign(monitoring, monitoring),
empresas: Object.assign(empresas, empresas),
estados: Object.assign(estados, estados),
extensiones: Object.assign(extensiones, extensiones),
iglesias: Object.assign(iglesias, iglesias),
integrations: Object.assign(integrations, integrations),
municipios: Object.assign(municipios, municipios),
paises: Object.assign(paises, paises),
parroquias: Object.assign(parroquias, parroquias),
pastores: Object.assign(pastores, pastores),
roles: Object.assign(roles, roles),
sucursales: Object.assign(sucursales, sucursales),
usuarios: Object.assign(usuarios, usuarios),
}

export default admin