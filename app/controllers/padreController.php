<?php
class padreController extends BaseController
{
    public function remoteEmail(){
        if(padre::where("email","=",Input::get("email"))->first())
            return "false";
        else return "true";
    }

    public function addPadre(){
        $datos = Input::get('data');
        $dateNow = date("Y-m-d");
        $date_min =strtotime("-18 year",strtotime($dateNow));
        $date_min=date("Y-m-d",$date_min);
        $hoy= date("Y-m-d");
        // $datos_tarjeta = array(
        //     "tarjetahabiente"   =>Input::get("tarjetahabiente"),
        //     "numero_tarjeta"    =>Input::get("numero_tarjeta"),
        //     "cvc"               =>Input::get("cvc"),
        //     "fecha_expiracion"  =>Input::get("fecha_expiracion")
        // );
        $rules = [
            "username"          =>"required|unique:users,username|max:50",
            "password"          =>"required|min:8|max:100",
            "cpassword"         =>"required|same:password",
            "nombre"            =>"required|letter|max:50",
            "apellido_paterno"  =>"required|letter|max:30",
            "apellido_materno"  =>"required|letter|max:30",
            "sexo"              =>"required|string|size:1",
            "fecha_nacimiento"  =>"required|date_format:Y-m-d|before:$date_min",
            "email"             =>"required|email|unique:padres,email",
            "telefono"          =>"required",
            "pais"              =>"required|exists:ladas_paises,name"
        ];
        $messages = [
               "required"    =>  "El campo :attribute es requerido",
               "alpha"       =>  "Solo puedes ingresar letras",
               "before"      =>  "La fecha que ingresaste tiene que ser menor al $date_min",
               "date"        =>  "Formato de fecha invalido",
               "numeric"     =>  "Solo se permiten digitos",
               "email"       =>  "Ingresa un formato de correo valido",
               "unique"      =>  "Este usuario ya existe",
               "integer"     =>  "Solo se permiten numeros enteros",
               "exists"      =>  "El campo :attribute no existe en el sistema",
               "unique"      =>  "El campo :attribute no esta disponible intente con otro valor",
               "integer"     =>  "Solo puedes ingresar numeros enteros",
               "same"        =>  "Las contraseñas no coinciden",
               "after"       =>  "La fecha de expiracion es incorrecta, no puedes ingresar fechas inferiores al día de hoy",
         ];
        try {
         $validator = Validator::make($datos,$rules,$messages);
        } catch (Exception $e) {
            return $e->getMessage();
        }
        if($validator->fails()){
            return $validator->messages();
        }
        else {
            try {
                $user = new User($datos);
                $user->password=Hash::make($datos["password"]);
                $user->token=sha1($datos['email']);
                $user->skin_id=skin::all()->first()->id;
                $user->save();
                $myRole = DB::table('roles')->where('name', '=', 'padre_free')->pluck('id');
                $user->attachRole($myRole);
                $persona = new persona($datos);
                $persona->user_id=$user->id;
                $persona->save();
                // $membresia = new membresia();
                // $membresia->token_card=sha1($datos_tarjeta["numero_tarjeta"]);
                // $membresia->fecha_registro= date("Y-m-d");
                // $membresia->active=1;
                // $membresia->save();
                $padre = new padre($datos);
                /*-------------------------------
                    Obtenemos la lada  según 
                    El pais seleccionado por
                    el usuario.
                --------------------------------*/
                $lada = ladaPais::where("name","=",$datos["pais"])->select("phone_code")->get()[0];
                /*------------------------------*/
                $padre->persona_id = $persona->id;
                if($lada){// si se encontro la lada en la consulta, entonces la establecemos, si no dejamos sin lada
                    $padre->telefono = "+".$lada->phone_code." ".$padre->telefono;
                }
                $padre->save();
                $perfil = new perfil();
                if ($datos['sexo'] == 'm'){
                  $perfil->foto_perfil="dad-def.png";
                }
                else{
                  $perfil->foto_perfil="mom-def.png";
                }
                $perfil->gustos="¿Cuáles son tus gustos?";
                $perfil->users_id=$user->id;
                $perfil->save();

            } catch (Exception $e){
                $user->delete();
                // $direccion->delete();
                // $membresia->delete();
                return $e->getMessage();
            }

            //  $dataSend = [
            //      "name"     =>       "Equipo Curiosity",
            //      "client"   =>       $persona->nombre." ".$persona->apellido_paterno." ".$persona->apellido_materno,
            //      "email"    =>       $padre->email,
            //      "subject"  =>       "¡Bienvenido a Curiosity Eduación!",
            //      "msg"      =>       "La petición de registro al sistema Curiosity que realizo ha sido realizada con exito, para confirmar y activar su cuenta siga el enlace que esta en la parte de abajo",
            //      "token"    =>       $user->token
            //  ];
            //  $toEmail=$padre->email;
            //  $toName=$dataSend["email"];
            //  $subject =$dataSend["subject"];
            //  try {
            //      Mail::send('emails.confirmar_registro',$dataSend,function($message) use($toEmail,$toName,$subject){
            //          $message->to($toEmail,$toName)->subject($subject);
            //      });
            //      return "OK";
            //  } catch (Exception $e) {
            //      $user->delete();
            //      // $direccion->delete();
            //      // $membresia->delete();
            //      $code = $e->getCode();
            //      return $code;
            //  }
            return "OK";

        }

    }
    public function confirmar($token){
        $user = User::where("token","=",$token)->first();
        if($user){
            $user->active=1;
            $user->save();
            return Redirect::to("/");
        }else{
          return Redirect::to("/");
        }
    }
    public function gethijos(){

        return DB::select("Select users.username, hijos.id,concat(personas.nombre,' ',personas.apellido_paterno) as 'nombre_completo', max(hijo_realiza_actividades.promedio) 'max_promedio' , actividades.nombre as 'actividad'
         from padres inner join hijos on hijos.padre_id = padres.id
        inner join hijo_realiza_actividades on hijos.id = hijo_realiza_actividades.hijo_id
        inner join actividades on hijo_realiza_actividades.actividad_id = actividades.id
        inner join personas on hijos.persona_id = personas.id
        inner join users on users.id = personas.user_id where padres.id = '37'");
    }
    public function sendMensaje(){
    try{
        $mensaje = new recordatorioHijo();
         $mensaje->hijo_recuerda=User::where('username','=',Input::get('hijo_recuerda'))->join('personas','personas.user_id','=','users.id')->join('hijos','hijos.persona_id','=','personas.id')->select('hijos.id')->get()[0]->id;
        $mensaje->mensaje=Input::get('mensaje');
        $mensaje->is_read = 0;
        $mensaje->padre_avisa=Input::get('padre_avisa');
        $mensaje->save();
        return Response::json(array("message"=>"El mensaje se envio al hijo","estado"=>"200"));
        }catch(Exception $e){return $e;}
    }

    public function getCountHijos(){
      return persona::join('padres', "personas.id", "=", "padres.persona_id")
      ->join("hijos", "padres.id", "=", "hijos.padre_id")
      ->where("user_id", "=", Auth::user()->id)
      ->count('hijos.padre_id');
    }

    public function seguimientoHijo(){
      $hijos = padre::join('hijos', 'padres.id', '=', 'hijos.padre_id')
      ->join('personas', 'hijos.persona_id', '=', 'personas.id')
      ->where('padres.id', '=', Auth::user()->persona()->first()->padre()->first()->id)
      ->select('hijos.id', 'personas.nombre', 'personas.apellido_paterno', 'personas.apellido_materno')
      ->get();
      $seguimientos = [];
      foreach ($hijos as $key => $value) {
        $segActsHijo = padre::join('hijos', 'padres.id', '=', 'hijos.padre_id')
        ->join('hijos_metas_diarias', 'hijos.id', '=' , 'hijos_metas_diarias.hijo_id')
        ->join('avances_metas', 'hijos_metas_diarias.id', '=', 'avances_metas.avance_id')
        ->where('hijos.id' ,'=', $value['id'])
        ->select('avances_metas.fecha', 'avances_metas.avance as cantidad')
        ->orderBy('avances_metas.fecha', 'desc')
        ->limit(7)
        ->get();
        $nombre = $value['nombre']." ".$value['apellido_paterno']." ".$value['apellido_materno'];
        array_push($seguimientos, array('seguimiento' => $segActsHijo, 'hijo' => $nombre, 'id' => $value['id']));
      }
      return $seguimientos;
    }

    public function getPuntajes(){
      return View::make('vista_papa_puntajes');
    }

    public function getAlertasNow(){
      return View::make('vista_papa_alertas');
    }
    public function getUsoPlataforma(){
        $now = date("Y-m-d");
        $idPadre = Auth::user()->persona()->first()->padre()->first()->id;
        return DB::select(
             "SELECT hijos.id, metas_diarias.meta, count(hijo_realiza_actividades.hijo_id) as 'total_jugados'
             FROM hijos
             inner join hijos_metas_diarias
             on hijos_metas_diarias.hijo_id = hijos.id
             inner join metas_diarias
             on metas_diarias.id = hijos_metas_diarias.meta_diaria_id
             inner join hijo_realiza_actividades on hijo_realiza_actividades.hijo_id = hijos.id
             inner join padres on  hijos.padre_id = padres.id
             where hijos.padre_id = $idPadre and hijo_realiza_actividades.created_at
             between  '$now 00:00:00' and '$now 23:59:59'
             group by(hijo_realiza_actividades.hijo_id)"
        );
    }

}
