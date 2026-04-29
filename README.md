# azure-tests

# install azure function core tools

    npm install -g azure-functions-core-tools

## run locally

    F5

# Install Azure CLI

    curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Authentication AZ:

    export SUBSCRIPTION_ID=fc54a208-6b3a-4c55-be9a-25348b9074d9
    export RESOURCE_GROUP=iothub-sbx

    az ad sp create-for-rbac \
      --name "gitlab-deployer" \
      --role contributor \
      --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP

    return:
    {
      "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "displayName": "gitlab-deployer",
      "password": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "tenant": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }

    CLIENT_ID: appId
    CLIENT_SECRET: password
    TENANT_ID: tenant

# Pipeline authentication

    az login \
      --service-principal -u $CLIENT_ID -p $CLIENT_SECRET \
      --tenant $TENANT_ID
    az account set
      --subscription $SUBSCRIPTION_ID

# deploy Angular (static web app)

    export WEBAPP_NAME=iothub-sbx-front
    export WEBAPP_DEPLOYMENT_TOKEN=750ddf7d6b2c59e16085d304eef79b30118208c7c1450243c1968a1ab4dc71ca02-8b89b0dd-b9a6-4c81-afa5-af9688bb59040031107015c8ee03

    cd src/angular
    npm ci
    ng build --configuration production
    npm ci --omit=dev

    npm install -g @azure/static-web-apps-cli

    swa deploy dist/angular/browser \
      --app-name "$WEBAPP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --env "production" \
      --deployment-token "$WEBAPP_DEPLOYMENT_TOKEN"

# deploy Angular (storage account static website)

    export STORAGE_ACCOUNT=iothubsbxstorage

    cd src/angular
    npm ci
    ng build --configuration production
    npm ci --omit=dev

    az storage blob upload-batch \
      --account-name $STORAGE_ACCOUNT \
      --destination '$web' \
      --source dist/angular/browser \
      --overwrite \
      --only-show-errors

# Deploy App Service

    export APP_SERVICE_NAME=iothub-sbx-api

    cd src/api
    npm ci
    rm -rf dist
    npm run build
    rm $APP_SERVICE_NAME.zip
    zip -r $APP_SERVICE_NAME.zip . -x "node_modules/*" "src/*" "test/*"

    az webapp config appsettings set \
      --name $APP_SERVICE_NAME \
      --resource-group $RESOURCE_GROUP \
      --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true

    az webapp deploy \
      --name $APP_SERVICE_NAME \
      --resource-group $RESOURCE_GROUP \
      --src-path $APP_SERVICE_NAME.zip \
      --type zip

# Deploy App Function

    export RESOURCE_GROUP=rg-frc-dt-infra-env-iothub-01
    export FUNCTION_APP_CODEC=azfunction-frc-dt-infra-env-iothub-codec-01

    cd src/functions
    npm ci
    rm -rf dist
    npm run build:prod
    npm ci --omit=dev
    rm *.zip
    zip -rq $FUNCTION_APP_CODEC.zip .
    npm ci

    az functionapp deployment source config-zip --name $FUNCTION_APP_CODEC --resource-group $RESOURCE_GROUP --src $FUNCTION_APP_CODEC.zip
