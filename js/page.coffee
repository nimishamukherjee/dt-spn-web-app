checkData = ->
  statUrl = "rac/stats?sessionId=#{getCookie('sessionId')}"
  $.ajax
    url: statUrl
    dataType: "json"
    success: (data) ->
      jsonData = data
      $("#connections").html jsonData.connections
      $("#installations").html jsonData.installations
	  
	error: (data) ->
      alert "Error in getting statistics data"

fetchConnectUrl = (callback) ->
  sessionId = undefined
  sessionId = getCookie("sessionId")
  $.ajax
    url: "/rac/url/" + sessionId
    success: callback
    error: ->
      alert "Unable to get the vpnrac:// protocol handler."

$(document).ready ->
 
  language = "english"
  $("[i18n]").each (count, i)->
    $(i).html resources[language][$(i).attr("i18n")]
  
  $("form#osSelect select").bind "change", ->
    $("#download #os").html $("option:selected", this).val()
  $("#download").click ->
    switch $("form#osSelect select option:selected").val()
      when "Windows"
        document.location = "downloads/BusinessVPN.msi"
      when "Mac"
        document.location = "downloads/mac-rac.dmg"
      when "Linux"
        document.location = "downloads/linux-rac.deb"
  $("form#osSelect select").val BrowserDetect.OS
  $("form#osSelect select").trigger "change"
  
  fetchConnectUrl (data) ->
    $("#connect").click ->
      location.assign data

  statUrl = "rac/stats?sessionId=#{getCookie('sessionId')}"
  $.ajax
    url: statUrl
    dataType: "json"
    success: (data) ->
      jsonData = data
      $("#connections").html jsonData.connections
      $("#installations").html jsonData.installations
    error: (data) ->
      alert "Error in getting statistics data"
