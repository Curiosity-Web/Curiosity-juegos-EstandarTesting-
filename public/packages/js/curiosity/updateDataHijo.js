$(document).ready(function() {

  // var dateNow = new Date();
  // var dateOld = new Date();
  // //restar 5 años a la fecha actual
  // dateNow.setMonth(dateNow.getMonth() - 60);
  // //restar 13 años a la fecha actual
  // dateOld.setMonth(dateNow.getMonth() - 156);
  //
  // $('.dpk').pickadate({
  //   monthsFull: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  //   monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  //   weekdaysFull: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado'],
  //   weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
  //   showMonthsShort: true,
  //   today: 'Hoy',
  //   clear: 'Limpiar',
  //   close: 'Cancelar',
  //   labelMonthNext: 'siguiente mes',
  //   labelMonthPrev: 'mes anterior',
  //   labelMonthSelect: 'menu de mes',
  //   labelYearSelect: 'menu de años',
  //   selectMonths: true,
  //   selectYears: 99,
  //   format: 'yyyy-mm-dd',
  //   min: [dateOld.getFullYear(),dateOld.getMonth(),dateOld.getDate()],
  //   max: [dateNow.getFullYear(),dateNow.getMonth(),dateNow.getDate()]
  // });

  var $frmval = $("#frm_user").validate({
    rules:{
      username_persona:{maxlength:50,required:true,remote:{
        url:"/remote-username-update",
        type:"post",
        username:function(){
          return $("input[name='username']").val();
        }
      }},
      password_new:{maxlength:100,minlength:8},
      cpassword_new:{equalTo:function(){
        return $("input[name='password_new']");
      }},
      nombre_persona:{required:true,maxlength:50,alpha:true},
      apellido_paterno_persona:{required:true,maxlength:30,alpha:true},
      apellido_materno_persona:{required:true,maxlength:30,alpha:true},
      sexo_persona:{required:true,maxlength:1},
      fecha_nacimiento_persona:{required:true,date:true}
    },
    messages:{
      cpassword_new:{equalTo:"La contraseña no coincide"},
      username_persona:{
        required:"No puedes dejaar en blanco este campo",
        remote:"Este nombre de usuario se encuentra en uso"
      },
      password_now:{remote:"La contraseña es incorrecta"}
    },
    errorPlacement: function (error, element) {
      error.appendTo(element.parent().parent());
    }
  });

  $("#btnupdate").click(function(){
    if($frmval.valid()){
      $btn =$(this);
      var text_temp = $(this).text();
      $(this).addClass("striped-alert");
      $(this).text("Actualizando...");
      $(this).prop("disabled",true);
      if($("input[name='password_new']").val()!==""){
        var datos={
          username_persona:$("input[name='username_persona']").val(),
          password_persona:$("input[name='password_persona']").val(),
          password_new:$("input[name='password_new']").val(),
          cpassword_new:$("input[name='cpassword_new']").val(),
          nombre_persona:$("input[name='nombre_persona']").val(),
          apellido_paterno_persona:$("input[name='apellido_paterno_persona']").val(),
          apellido_materno_persona:$("input[name='apellido_materno_persona']").val(),
          sexo_persona:$("select[name='sexo_persona']").val(),
          fecha_nacimiento_persona:$("input[name='fecha_nacimiento_persona']").val()
        }
        $.ajax({
          url:"/updatePerfil",
          type:"post",
          data:{data:datos},
          beforeSend: function(){
            message = "Espera.. Los datos se estan Actualizando... Verificando información";
            $curiosity.noty(message, 'info');
          }
        })
        .done(function(r){
          if($.isPlainObject(r)){
            alerta.errorOnInputs(r);
            $curiosity.noty("Algunos campos no fueron obtenidos... Favor de verificar la información  e intentar nuevamente ","warning");
          }else if(r == "contraseña incorrecta"){
            $curiosity.noty("Contraseña incorreca","warning");
          }
          else if(r =="bien"){
            $("#btnCncl").trigger('click');
            $("#menu-usuario").text(datos.nombre_persona+" "+datos.apellido_paterno_persona);
            $("input[name='password_persona']").val('');
            $("input[name='password_new']").val('');
            $("input[name='cpassword_new']").val('');
            $curiosity.noty("Los datos se han actualizado correctamente, su contraseña ha sido cambiada con exito!!","success");
            $("span#name-complete").text(datos.nombre_persona+" "+datos.apellido_paterno_persona+" "+datos.apellido_materno_persona);
            $("span#username-profile").text(datos.username_persona);
            $("label.error").remove();
            $("#editar_datos").modal('hide');
          }
        }).always(function(){
            $btn.text(text_temp);
            $btn.removeClass("striped-alert");
            $btn.prop("disabled",false);
        });
      }else{
        var datos = {
           username_persona:$("input[name='username_persona']").val(),
           nombre_persona:$("input[name='nombre_persona']").val(),
           apellido_paterno_persona:$("input[name='apellido_paterno_persona']").val(),
           apellido_materno_persona:$("input[name='apellido_materno_persona']").val(),
           sexo_persona:$("select[name='sexo_persona']").val(),
           fecha_nacimiento_persona:$("input[name='fecha_nacimiento_persona']").val()
         }
         $.ajax({
           url:"/updatePerfilUser",
           type:"post",
           data:{data:datos},
           beforeSend: function(){
             message = "Espera.. Los datos se estan Actualizando... Verificando información";
             $curiosity.noty(message, 'info');
           }
         }).done(function(r){
           if($.isPlainObject(r)){
             alerta.errorOnInputs(r);
             $curiosity.noty("Algunos campos no fueron obtenidos... Favor de verificar la información  e intentar nuevamente ","warning");
           }else if(r == "bien"){
             $("#btnCncl").trigger('click');
             $("#menu-usuario").text(datos.nombre_persona+" "+datos.apellido_paterno_persona);
             $curiosity.noty("Los datos se han actualizado correctamente","success");
             $("label.error").remove();
             $("span#name-complete").text(datos.nombre_persona+" "+datos.apellido_paterno_persona+" "+datos.apellido_materno_persona);
             $("span#username-profile").text(datos.username_persona);
             $("#editar_datos_papa").modal('hide');
           }
         }).always(function(r){
           $btn.text(text_temp);
           $btn.removeClass("striped-alert");
           $btn.prop("disabled",false);
         });
       }
     }
  });

  $("#menuDatos").click(function(event) {
    $("#sectionGralPerfil").hide('slow');
    $("#updatedatachild").show('slow');
  });

  $("#btnCncl").click(function(event) {
    $("#updatedatachild").hide('slow');
    $("#sectionGralPerfil").show('slow');
  });

  // utilización del cropper

  var $imgCrop = $("#imageH");
  var $imagenForCrop;
  var $objNavigator;
  var $objetoUrl;
  var pesoMaximoInCrop = 2048000;
  var extensionesInCrop = new Array(".png", ".jpg", ".jpeg");
  var tempSRC;

  $imgCrop.cropper({
    aspectRatio : 1/1,
    responsive: true,
    autoCropArea : 0.8,
    preview : ".preview",
    dragMode :'crop',
    crop: function(e) {
      $("#datX").val(e.x + " px");
      $("#datY").val(e.y + " px");
      $("#datW").val(e.width + " px");
      $("#datH").val(e.height + " px");
    }
  });

  $("#inImageH").change(function() {
    tempSRC = $imgCrop.attr('src');
    var $archivo = $(this);
    if($curiosity.comprobarFile($archivo.val(), extensionesInCrop)){
      $imagenForCrop = document.getElementById("inImageH").files;
      if($imagenForCrop[0].size <= pesoMaximoInCrop){
        $objNavigator = window.URL || window.webkitURL;
        $objetoUrl = $objNavigator.createObjectURL($imagenForCrop[0]);
        cambiarContenidoCropper($objetoUrl);
      }
      else{
        $archivo.val('');
        cambiarContenidoCropper(tempSRC);
        $curiosity.noty("La imagen seleccionada excede el peso máximo (2 MB)", 'warning');
      }
    }
    else{
      $archivo.val('');
      cambiarContenidoCropper(tempSRC);
    }
  });

  function cambiarContenidoCropper($src){
    $imgCrop.one('built.cropper', function(){}).cropper('reset').cropper('replace', $src);
    console.log("chanegCropperContent");
  }

  $("#btnRecortarH").click(function(event) {
    var txtBtn = $(this).text();
    $(this).text("Guardando");
    var formData = new FormData($("#frm_change_image_H")[0]);
    formData.append('x', $("#datX").val());
    formData.append('y', $("#datY").val());
    formData.append('w', $("#datW").val());
    formData.append('h', $("#datH").val());
    $.ajax({
      url: '/foto',
      type: 'POST',
      data: formData,
      cache:false,
      contentType:false,
      processData:false,
    })
    .done(function(r) {
      console.log(r);
      $(".img-profile").attr("src", r);
      $curiosity.noty("La imagen fue guardada y/o recortada exitosamente","success");
      $("button[data-dismiss='modal']").trigger("click");
    })
    .fail(function(e) {
      console.log(e);
    })
    .always(function(){
      $(this).text(txtBtn);
    });

  });

});
