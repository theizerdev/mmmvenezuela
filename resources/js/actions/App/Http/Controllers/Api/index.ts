import AsistenciaApiController from './AsistenciaApiController'
import PresbiterioApiController from './PresbiterioApiController'
const Api = {
    AsistenciaApiController: Object.assign(AsistenciaApiController, AsistenciaApiController),
PresbiterioApiController: Object.assign(PresbiterioApiController, PresbiterioApiController),
}

export default Api