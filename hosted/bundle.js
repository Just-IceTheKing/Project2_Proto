"use strict";

var handleDomo = function handleDomo(e) {
  e.preventDefault();

  $("#domoMessage").animate({ width: 'hide' }, 350);

  if ($("#domoName").val() == '' || $("#domoAge").val() == '' || $("#domoCity").val() == '') {
    handleError("RAWR! All fields are required");
    return false;
  }

  sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function () {
    loadDomosFromServer();
  });

  return false;
};

var handleDeleteClick = function handleDeleteClick(e) {
  DeleteDomo(e);
};

var DeleteDomo = function DeleteDomo(e) {
  var csrfToken = $("#_csrf").val();

  // console.dir(e.target.name);
  var currentDomo = {
    name: e.target.name,
    _csrf: csrfToken
  };

  sendAjax('POST', '/deleteDomo', currentDomo, function () {
    loadDomosFromServer();
  });
};

var DomoForm = function DomoForm(props) {
  return React.createElement(
    "form",
    { id: "domoForm",
      onSubmit: handleDomo,
      name: "domoForm",
      action: "/maker",
      method: "POST",
      className: "domoForm"
    },
    React.createElement(
      "label",
      { htmlFor: "name" },
      "Name: "
    ),
    React.createElement("input", { id: "domoName", type: "text", name: "name", placeholder: "Domo Name" }),
    React.createElement(
      "label",
      { htmlFor: "age" },
      "Age: "
    ),
    React.createElement("input", { id: "domoAge", type: "text", name: "age", placeholder: "Domo Age" }),
    React.createElement(
      "label",
      { htmlFor: "city" },
      "Home City: "
    ),
    React.createElement("input", { id: "domoCity", type: "text", name: "city", placeholder: "Domo City" }),
    React.createElement("input", { type: "hidden", id: "_csrf", name: "_csrf", value: props.csrf }),
    React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Make Domo" })
  );
};

var ChangePassForm = function ChangePassForm(props) {
  return React.createElement(
    "form",
    { id: "changePassForm", name: "changePassForm",
      onSubmit: handleChangePass,
      action: "/changePass",
      method: "POST",
      className: "mainForm"
    },
    React.createElement(
      "label",
      { htmlFor: "newPass" },
      "Password: "
    ),
    React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "password" }),
    React.createElement(
      "label",
      { htmlFor: "pass2" },
      "Password: "
    ),
    React.createElement("input", { id: "pass2", type: "password", name: "pass2", placeholder: "retype password" }),
    React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
    React.createElement("input", { className: "formSubmit", type: "submit", value: "Submit" })
  );
};

var handleChangePass = function handleChangePass(e) {
  e.preventDefault();

  $("#domoMessage").animate({ width: 'hide' }, 350);

  if ($("#pass").val() == '' || $("#pass2").val() == '') {
    handleError("RAWR! All fields are required");
    return false;
  }

  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("RAWR! All fields are required");
    return false;
  }

  console.dir($("#changePassForm").serialize());

  sendAjax('POST', $("#changePassForm").attr("action"), $("#changePassForm").serialize(), redirect);

  return false;
};

var DomoList = function DomoList(props) {
  if (props.domos.length === 0) {
    return React.createElement(
      "div",
      { className: "domoList" },
      React.createElement(
        "h3",
        { className: "emptyDomo" },
        "No Domos yet"
      )
    );
  }

  var domoNodes = props.domos.map(function (domo) {
    return React.createElement(
      "div",
      { key: domo._id, className: "domo" },
      React.createElement("img", { src: "/assets/img/domoface.jpeg", alt: "domo face", className: "domoFace" }),
      React.createElement(
        "h3",
        { className: "domoName" },
        " Name: ",
        domo.name,
        " "
      ),
      React.createElement(
        "h3",
        { className: "domoAge" },
        " Age: ",
        domo.age,
        " "
      ),
      React.createElement(
        "h3",
        { className: "domoCity" },
        " City: ",
        domo.city,
        " "
      ),
      React.createElement("input", { type: "submit", value: "Delete Domo", name: domo.name, onClick: handleDeleteClick })
    );
  });

  return React.createElement(
    "div",
    { className: "domoList" },
    domoNodes
  );
};

var loadDomosFromServer = function loadDomosFromServer() {
  sendAjax('GET', '/getDomos', null, function (data) {
    ReactDOM.render(React.createElement(DomoList, { domos: data.domos }), document.querySelector("#domos"));
  });
};

var setupMakerPage = function setupMakerPage(csrf) {
  ReactDOM.render(React.createElement(DomoForm, { csrf: csrf }), document.querySelector("#makeDomo"));

  ReactDOM.render(React.createElement(DomoList, { domos: [] }), document.querySelector("#domos"));

  loadDomosFromServer();
};

var setupChangePassPage = function setupChangePassPage(csrf) {
  ReactDOM.render(React.createElement("h1", null), document.querySelector("#makeDomo"));

  ReactDOM.render(React.createElement(ChangePassForm, { csrf: csrf }), document.querySelector("#domos"));
};

var setupNavButtons = function setupNavButtons(csrf) {
  var makerButton = document.querySelector("#makerButton");
  var changePassButton = document.querySelector("#changePassButton");

  makerButton.addEventListener("click", function (e) {
    e.preventDefault();
    setupMakerPage(csrf);
    return false;
  });

  changePassButton.addEventListener("click", function (e) {
    e.preventDefault();
    setupChangePassPage(csrf);
    return false;
  });
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setupNavButtons(result.csrfToken);
    setupMakerPage(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#domoMessage").animate({ width: 'toggle' }, 350);
};

var redirect = function redirect(response) {
  $("#domoMessage").animate({ width: 'hide' }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
