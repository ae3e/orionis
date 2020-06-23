import * as env from '../env.js'
function settingsComponent(props) {
  //https://community.fitbit.com/t5/SDK-Development/3rd-party-REST-API-OAuth-authentication/m-p/2322273#M1706
  return (
    <Page>
      <Section
        title={
          <Text bold align="center">
            Orionis Settings
          </Text>

        }
        description={<Text> Read the <Link source="https://github.com/ae3e/orionis#readme">user's guide</Link></Text>}
      >
        {/*<TextInput
          label="polyline"
          settingsKey="polyline"
          onChange={value => console.log(value.name)}
        />*/}

        <StravaLogin
          title="Strava Login"
          settingsKey="strava"
          clientId={env.strava.clientId}
          clientSecret={env.strava.clientSecret}
          onAccessToken={async (accessToken, userInfo) => {
            //console.log(accessToken);
            //console.log(JSON.stringify(userInfo));
            /*fetch('https://www.strava.com/api/v3/athletes/'+userInfo.id+'/routes?page=1&per_page=30',{
              headers : {
                "Authorization":"Bearer "+ accessToken
              }
            })
            .then(function(response) {
              console.log("fetched");
              return response.json();
            })
            .then(function(json) {
              console.log(JSON.stringify(json.filter(elt=>elt.starred)[0].name));
              props.settingsStorage.setItem('route', JSON.stringify(json.filter(elt=>elt.starred)[0]))
            })
            .catch(function(err){
              console.log(JSON.stringify(err));
            });*/
          }}
        />

        <TextInput
          label="Choose a route"
          settingsKey="route"
          placeholder="Type route's name"
          action="Add"
          onChange={()=> props.settingsStorage.setItem("message","Route changed")}
          onAutocomplete={async (value)=>{
            
            let strava = JSON.parse(props.settings.strava);
            let response = await fetch('https://www.strava.com/api/v3/athletes/' + strava.athlete.id + '/routes?page=1&per_page=30', {
              headers: {
                "Authorization": "Bearer " + strava.access_token
              }
            })

            let routes = await response.json()
            let data = routes.map(obj=>{return{name:obj.name,value:obj.id_str}});
            return data.filter((option) => option.name.includes(value));
          }}
        />

        <Button
          label="Update"
          onClick={() => {
            props.settingsStorage.setItem('refresh', JSON.stringify({ name: new Date().getTime() + '' }))

          }}
        />

        <Text>{props.settings.message}</Text>

        {/*
        //Try to find a a way to logout
        <Link source="https://www.strava.com/logout">Logout (How to come back?)</Link>
        <Button
          label="Unauthorized (Doesn't work)"
          onClick={() => {

            let token = props.settingsStorage.getItem('strava').access_token;

            fetch('https://www.strava.com/oauth/deauthorize',{
              method:'POST',  
              headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
              body:'access_token='+token
            })
            .then(function(response) {
              console.log("fetched");
              return response.json();
            })
            .then(function(json) {
              console.log(JSON.stringify(json));
              props.settingsStorage.removeItem('strava')
            })
            .catch(function(err){
              console.log(JSON.stringify(err));
            });

          }}
        />
        */}
      </Section>
    </Page>
  );
}


let transfer = () => {
  console.log("Clicked!")
}
registerSettingsPage(settingsComponent);
