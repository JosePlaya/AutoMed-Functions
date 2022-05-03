const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
//const serviceAccount = require("/Users/Shared/AutoMed-Functions/functions/permission.json");
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

admin.initializeApp();

const app = express();
const db = admin.firestore();

const centrosPath = 'centros';
const adminsPath = 'admins';
const medicoPath = 'medicos';
const pacientesPath = 'pacientes';
const medicamentosPath = 'medicamentos';
const preescripcionPath = 'preescripcion';
const farmaceuticosPath = 'farmaceuticos';

const adminUserCreationValidators = [
    body('correo').isEmail().withMessage("Correo invalido"),
    body('nombre').notEmpty().withMessage("Falta nombre"),
    body('apaterno').notEmpty().withMessage("Falta apellido paterno"),
    body('amaterno').notEmpty().withMessage("Falta apellido materno"),
    body('password').isLength({min: 5}).withMessage("Largo mínimo de 5 dígitos")
   ];

   const pacienteCreationValidators = [
    body('correo').isEmail().optional().withMessage("Correo invalido"),
    body('telefono').isInt().optional().isLength({min: 11}).withMessage("Teléfono invalido"),
    body('nombre').notEmpty().withMessage("Falta nombre"),
    body('apaterno').notEmpty().withMessage("Falta apellido paterno"),
    body('amaterno').notEmpty().withMessage("Falta apellido materno"),
    body('rut').notEmpty().withMessage("Falta rut"),
    body('fechan').isDate().withMessage("Fecha de nacimiento invalida"),
    body('im_carnet').optional(),
    body('im_cif').optional(),
    body('color_cif').notEmpty().isIn(['rosado', 'celeste', 'verde']).withMessage('Falta color de la cif o color no es válido: rosado, celeste o verde.'),
    body('not_wsp').isBoolean().withMessage("Dato boleano"),
    body('not_cor').isBoolean().withMessage("Dato boleano")
   ];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// ------------------------------------------------- \\
//                      STATUS                       \\
// ------------------------------------------------- \\
// STATUS
app.get('/status/', (rep, res) => {
    return res.status(200).send('Web API: ONLINE')
});



// ------------------------------------------------- \\
//                   CREAR USUARIO                   \\
// ------------------------------------------------- \\
// NEW ADMIN USER
app.post('/new-admin/', adminUserCreationValidators, async (req, res) => {

    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Variables del request
    const correo = req.body.correo;
    const nombre = req.body.nombre;
    const apaterno = req.body.apaterno;
    const amaterno = req.body.amaterno;
    const displayName = nombre +' '+ apaterno +' '+ amaterno

    // Crear datos usuario para BD
    const user = req.body
    
    try {
        // Crear usuario en Auth
        await admin.auth().createUser({
            email: correo,
            emailVerified: true,
            password: req.body.password,
            displayName: displayName,
            disabled: false
          })
            // Almacenar datos del usuario en Firestore
            .then(function(userRecord) {
                try {
                    db.collection(adminsPath)
                    .doc(userRecord.uid)
                    .create(user);
                    return res.status(201).send(`Nuevo usuario admin creado: ${displayName}`);
                } catch (error) {
                    res.status(400).send(`Error: SE HA CREADO EL USUARIO, PERO NO SE ALAMCENARON LOS DATOS. ${error}`);
                }
            })
            .catch(function(error) {
                res.status(400).send(`Error: ${error}`);
            });
    } catch (error) {
        res.status(500).send(`${error}`)
    }
});

// NEW MEDICO USER
app.post('/new-medico/', async (req, res) => {
    
    // Variables del request
    const rut = req.body.rut;
    const correo = req.body.correo;
    const nombre = req.body.nombre;
    const apaterno = req.body.apaterno;
    const amaterno = req.body.amaterno;
    const especialidad = req.body.especialidad;
    const idCentroMedico = req.body.idCentroMedico;
    const displayName = nombre +' '+ apaterno +' '+ amaterno

    try {
        // Crear usuario en Auth
        await admin.auth().createUser({
            email: correo,
            emailVerified: true,
            password: req.body.password,
            displayName: displayName,
            disabled: false
          })
            // Almacenar datos del usuario en Firestore
            .then(function(userRecord) {
                try {
                    db.collection(medicoPath)
                    .doc(userRecord.uid)
                    .create({
                        rut: rut,
                        correo: correo,
                        nombre: nombre,
                        apaterno: apaterno,
                        amaterno: amaterno,
                        especialidad: especialidad,
                        idCentroMedico: idCentroMedico
                    });
                    return res.status(201).send(`Nuevo usuario medico creado: ${displayName}`);
                } catch (error) {
                    res.status(400).send(`Error: SE HA CREADO EL USUARIO, PERO NO SE ALAMCENARON LOS DATOS. ${error}`);
                }
            })
            .catch(function(error) {
                res.status(400).send(`Error: ${error}`);
            });
    } catch (error) {
        res.status(500).send(`${error}`)
    }
});

// NEW FARMACEUTICO USER
app.post('/new-farmaceutico/', async (req, res) => {
    
    // Variables del request
    const rut = req.body.rut;
    const correo = req.body.correo;
    const nombre = req.body.nombre;
    const apaterno = req.body.apaterno;
    const amaterno = req.body.amaterno;
    const idCentroMedico = req.body.idCentroMedico;
    const displayName = nombre +' '+ apaterno +' '+ amaterno

    try {
        // Crear usuario en Auth
        await admin.auth().createUser({
            email: correo,
            emailVerified: true,
            password: req.body.password,
            displayName: displayName,
            disabled: false
          })
            // Almacenar datos del usuario en Firestore
            .then(function(userRecord) {
                try {
                    db.collection(farmaceuticosPath)
                    .doc(userRecord.uid)
                    .create({
                        rut: rut,
                        correo: correo,
                        nombre: nombre,
                        apaterno: apaterno,
                        amaterno: amaterno,
                        idCentroMedico: idCentroMedico
                    });
                    return res.status(201).send(`Nuevo usuario farmaceutico creado: ${displayName}`);
                } catch (error) {
                    res.status(400).send(`Error: SE HA CREADO EL USUARIO, PERO NO SE ALAMCENARON LOS DATOS. ${error}`);
                }
            })
            .catch(function(error) {
                res.status(400).send(`Error: ${error}`);
            });
    } catch (error) {
        res.status(500).send(`${error}`)
    }
});



// ------------------------------------------------- \\
//                     CENTORS                       \\
// ------------------------------------------------- \\
// CREAR NUEVO CENTRO
app.post('/centro/', async (req, res) => {
    try {
        await db.collection(centrosPath)
        .doc()
        .create({
            tipo: req.body.tipo,
            nombre: req.body.nombre,
            direccion: req.body.direccion,
            comuna: req.body.comuna,
            region: req.body.region
        });
        return res.status(201).send(`Nuevo centro creado: ${req.body.nombre}`);
    } catch (error) {
        res.status(400).send(`Error: ${error}`)
    }        
});

// OBTENER TODOS LOS CENTRO
app.get('/centros/', async (req, res) => {
    try {
        const query = db.collection(centrosPath);
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        // Verificar que existan datos
        if(querySnapshot.size == 0){
            // No hay centros
            return res.status(404).send(`No exsten centros`)
        }

        const response = docs.map((doc) => ({
            id: doc.id,
            nombre: doc.data().nombre,
            direccion: doc.data().direccion,
            comuna: doc.data().comuna,
            region: doc.data().region
        }));
        

        return res.status(200).json(response);
    } catch (error) {
        return res.status(400).send(`Error: ${error}`)
    }        
});

// OBTENER UN CENTRO
app.get('/centros/:centro_id', async (req, res) => {
    try {
        const doc = db.collection(centrosPath).doc(req.params.centro_id);
        const centro = await doc.get();
        const response = centro.data();

        // Verificar que existan datos
        if (response == null){
            // No se hayó el CA
            return res.status(404).send(`Centro no encontrado`);    
        }else{
            // Existe el CA
            // Se devuelven sus datos
            return res.status(200).json(response);
        }
    } catch (error) {
        res.status(400).send(`Error: ${error}`)
    }        
});



// ------------------------------------------------- \\
//                     PACIENTES                     \\
// ------------------------------------------------- \\
// CREAR NUEVO PACIENTE
app.post('/paciente/', pacienteCreationValidators, async (req, res) => {

    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Crear datos usuario para BD
    const paciente = req.body

    try {
        await db.collection(pacientesPath)
        .doc()
        .create(paciente);
        return res.status(201).send(`Nuevo paciente creado: ${req.body.nombre}`);
    } catch (error) {
        res.status(400).send(`Error: ${error}`);
    }        
});

// OBTENER TODOS LOS PACIENTES
app.get('/pacientes/', async (req, res) => {
    try {
        const query = db.collection(pacientesPath);
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        // Verificar que existan datos
        if(querySnapshot.size == 0){
            // No hay centros
            return res.status(404).send(`No existen pacientes`)
        }

        const response = docs.map((doc) => ({
            id: doc.id,
            nombre: doc.data().nombre,
            apaterno: doc.data().apaterno,
            amaterno: doc.data().amaterno,
            rut: doc.data().rut,
            correo: doc.data().correo,
            telefono: doc.data().telefono,
            fechan: doc.data().fechan,
            color_cif: doc.data().color_cif,
            not_wsp: doc.data().not_wsp,
            not_cor: doc.data().not_cor
        }));
        return res.status(200).json(response);
    } catch (error) {
        res.status(400).send(`Error: ${error}`)
    }        
});

// OBTENER UN PACIENTE POR ID
app.get('/paciente-id/:pac_id', async (req, res) => {
    try {
        const doc = db.collection(pacientesPath).doc(req.params.pac_id);
        const paciente = await doc.get();
        const response = paciente.data();

        // Verificar que existan datos
        if (response == null){
            // No se hayó el Medicamento
            return res.status(404).send(`Paciente no encontrado`);    
        }else{
            // Existe el paciente
            // Se devuelven sus datos
            return res.status(200).json(response);
        }
    } catch (error) {
        res.status(400).send(`Error: ${error}`)
    }        
});

// OBTENER UN PACIENTE POR RUT
app.get('/paciente-rut/:pac_rut', async (req, res) => {
    try {
        const query = await db.collection(pacientesPath).where('rut', '==', req.params.pac_rut);
        const querySnapshot = await query.get();
        const paciente = querySnapshot.docs;

        // Verificar que existan datos
        if(querySnapshot.size == 0){
            // No hay centros
            return res.status(404).send(`No existe el paciente`)
        }

        const response = paciente.map((doc) => ({
            id: doc.id,
            nombre: doc.data().nombre,
            apaterno: doc.data().apaterno,
            amaterno: doc.data().amaterno,
            rut: doc.data().rut,
            correo: doc.data().correo,
            telefono: doc.data().telefono,
            fechan: doc.data().fechan,
            color_cif: doc.data().color_cif,
            not_wsp: doc.data().not_wsp,
            not_cor: doc.data().not_cor
        }));
        return res.status(200).json(response);        
    } catch (error) {
        res.status(400).send(`Error: ${error}`)
    }        
});

// ACTUALIZAR UN PACIENTE
app.patch('/paciente/:pac_id', async (req, res) => {
    try {
        const updatedDoc = await admin.firebaseHelper.firestore
            .updateDocument(db, pacientesPath, req.params.pac_id, req.body);
        return res.status(200).send(`Fue actualizado el paciente: ${updatedDoc}`);
    } catch (error) {
        return res.status(400).send(`Error: ${error}`);
    }
});

// ELIMINAR PACIENTE 
app.delete('/paciente/:pac_id', async (req, res) => {
    try {
        const deletedPac = await db.collection(pacientesPath).doc(req.params.pac_id).delete();
        return res.status(200).send(`Fue eliminado el paciente: ${req.params.pac_id}`);
    } catch (error) {
        return res.status(500).send(`Error: ${error}`);
    }
});



// ------------------------------------------------- \\
//                INFORMACIÓN USUARIOS               \\
// ------------------------------------------------- \\
// OBTENER INFORMACIÓN USUARIO ADMIN
app.get('/admins/:user_id', async (req, res) => {
    try {
        const doc = db.collection(adminsPath).doc(req.params.user_id);
        const user = await doc.get();
        const response = user.data();
        // Verificar que existan datos
        if (response == null){
            // No se hayó el CA
            return res.status(404).send(`Admin no encontrado`);    
        }else{
            // Existe el CA
            // Se devuelven sus datos
            return res.status(200).json(response);
        }
    } catch (error) {
        res.status(400).send(`Error: ${error}`)
    }        
});

// OBTENER INFORMACIÓN USUARIO FARMACEUTICO
app.get('/medicos/:user_id', async (req, res) => {
    try {
        const doc = db.collection(medicoPath).doc(req.params.user_id);
        const user = await doc.get();
        const response = user.data();
        // Verificar que existan datos
        if (response == null){
            // No se hayó el CA
            return res.status(404).send(`Medico no encontrado`);    
        }else{
            // Existe el CA
            // Se devuelven sus datos
            return res.status(200).json(response);
        }
    } catch (error) {
        res.status(400).send(`Error: ${error}`)
    }        
});

// OBTENER INFORMACIÓN USUARIO FARMACEUTICO
app.get('/farmaceuticos/:user_id', async (req, res) => {
    try {
        const doc = db.collection(farmaceuticosPath).doc(req.params.user_id);
        const user = await doc.get();
        const response = user.data();
        // Verificar que existan datos
        if (response == null){
            // No se hayó el CA
            return res.status(404).send(`Farmaceutico no encontrado`);    
        }else{
            // Existe el CA
            // Se devuelven sus datos
            return res.status(200).json(response);
        }
    } catch (error) {
        res.status(400).send(`Error: ${error}`)
    }        
});



// ------------------------------------------------- \\
//                    MEDICAMENTOS                   \\
// ------------------------------------------------- \\
// CREAR NUEVO MEDICAMENTOS
app.post('/medicamento/', async (req, res) => {
    try {
        await db.collection(medicamentosPath)
        .doc()
        .create({
            stock: req.body.stock,
            nombre: req.body.nombre,
            codigo: req.body.codigo,
            gramaje: req.body.gramaje,
            cantidad: req.body.cantidad,
            contenido: req.body.contenido,
            fabricante: req.body.fabricante,
            descripcion: req.body.descripcion,
            idCentroMedico: req.body.idCentroMedico
        });
        return res.status(201).send(`Nuevo medicamento creado: ${req.body.nombre}`);
    } catch (error) {
        res.status(400).send(`Error: ${error}`);
    }        
});

// OBTENER TODOS LOS MEDICAMENTOS
app.get('/medicamentos/', async (req, res) => {
    try {
        const query = db.collection(medicamentosPath);
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        // Verificar que existan datos
        if(querySnapshot.size == 0){
            // No hay centros
            return res.status(404).send(`No exsten medicamentos`)
        }

        const response = docs.map((doc) => ({
            id: doc.id,
            nombre: doc.data().nombre,
            direccion: doc.data().direccion,
            comuna: doc.data().comuna,
            region: doc.data().region
        }));
        return res.status(200).json(response);
    } catch (error) {
        res.status(400).send(`Error: ${error}`)
    }        
});

// OBTENER UN MEDICAMENTO
app.get('/medicamento/:med_id', async (req, res) => {
    try {
        const doc = db.collection(medicamentosPath).doc(req.params.med_id);
        const medicamento = await doc.get();
        const response = medicamento.data();

        // Verificar que existan datos
        if (response == null){
            // No se hayó el Medicamento
            return res.status(404).send(`Medicamento no encontrado`);    
        }else{
            // Existe el medicamento
            // Se devuelven sus datos
            return res.status(200).json(response);
        }
    } catch (error) {
        res.status(400).send(`Error: ${error}`)
    }        
});

// ACTUALIZAR UN MEDICAMENTO
app.patch('/medicamento/:med_id', async (req, res) => {
    try {
        const updatedDoc = await admin.firebaseHelper.firestore
            .updateDocument(db, medicamentosPath, req.params.med_id, req.body);
        res.status(200).send(`Fue actualizado el medicamento: ${updatedDoc}`);
    } catch (error) {
        res.status(400).send(`Error: ${error}`);
    }
});

// ELIMINAR MEDICAMENTO 
app.delete('/medicamento/:med_id', async (req, res) => {
    try {
        const deletedMed = await admin.firebaseHelper.firestore
            .deleteDocument(db, medicamentosPath, req.params.med_id);
        res.status(200).send(`Fue eliminado el medicamento: ${deletedMed}`);
    } catch (error) {
        res.status(400).send(`Error: ${error}`);
    }
});

// ------------------------------------------------- \\
//                    PREESCRIPCIÓN                  \\
// ------------------------------------------------- \\
// OBTENER TODOS LOS MEDICAMENTOS
app.get('/preescipciones/', async (req, res) => {
    try {
        const query = db.collection(preescripcionPath);
        const querySnapshot = await query.get();
        const docs = querySnapshot.docs;

        const response = docs.map((doc) => ({
            id: doc.id,
            nombre: doc.data().nombre,
            direccion: doc.data().direccion,
            comuna: doc.data().comuna,
            region: doc.data().region
        }));
        return res.status(200).json(response);
    } catch (error) {
        res.status(400).send(`Error: ${error}`)
    }        
});

// OBTENER UNA PREESCRIPCION
app.get('/preescipcion/:pre_id', async (req, res) => {
    try {
        const doc = db.collection(preescripcionPath).doc(req.params.pre_id);
        const centro = await doc.get();
        const response = centro.data();
        return res.status(200).json(response);
    } catch (error) {
        res.status(400).send(`Error: ${error}`)
    }        
});

// CREAR NUEVO MEDICAMENTOS
app.post('/preescipcion/', async (req, res) => {
    try {
        await db.collection(medicamentosPath)
        .doc()
        .create({
            stock: req.body.stock,
            nombre: req.body.nombre,
            codigo: req.body.codigo,
            gramaje: req.body.gramaje,
            cantidad: req.body.cantidad,
            contenido: req.body.contenido,
            fabricante: req.body.fabricante,
            descripcion: req.body.descripcion,
            idCentroMedico: req.body.idCentroMedico
        });
        return res.status(201).send(`Nuevo medicamento creado: ${req.body.nombre}`);
    } catch (error) {
        res.status(400).send(`Error: ${error}`);
    }        
});

// ACTUALIZAR UN MEDICAMENTO
app.patch('/medicamento/:med_id', async (req, res) => {
    try {
        const updatedDoc = await admin.firebaseHelper.firestore
            .updateDocument(db, medicamentosPath, req.params.med_id, req.body);
        res.status(204).send(`Fue actualizado el medicamento: ${updatedDoc}`);
    } catch (error) {
        res.status(400).send(`Error: ${error}`);
    }
});

// ELIMINAR MEDICAMENTO 
app.delete('/medicamento/:med_id', async (req, res) => {
    try {
        const deletedMed = await admin.firebaseHelper.firestore
            .deleteDocument(db, medicamentosPath, req.params.med_id);
        res.status(204).send(`Fue eliminado el medicamento: ${deletedMed}`);
    } catch (error) {
        res.status(400).send(`Error: ${error}`);
    }
});


//---------------------------------------------------
exports.webApi = functions.https.onRequest(app);