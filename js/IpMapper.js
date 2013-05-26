
//Utility class for converting ip addresses to location coordinates
var IpMapper = function(){
  

}

//Queries GeoIpWebServices http://dev.maxmind.com/geoip/geoip2/web-services for location of ip
IpMapper.prototype.getPosition = function(ipAddress){
  $.ajax({
    url:'https://geoip.maxmind.com/geoip/v2.0/city/'+ipAddress,
    contentType: 'application/vnd.maxmind.com-city+json; charset=UTF-8; version=2.0',
    success: function(data){
      console.log(data);
    },
    error: function(data) {
      console.log('Ajax request failed');
    }
  });

}