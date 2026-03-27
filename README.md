# azure-tests

# install azure function core tools

    npm install -g azure-functions-core-tools

## run locally

    F5

# Install Azure CLI

    curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Authentication AZ:

    export AZURE_SUBSCRIPTION_ID=fc54a208-6b3a-4c55-be9a-25348b9074d9
    export AZURE_RESOURCE_GROUP=iothub-sbx

    az ad sp create-for-rbac \
      --name "gitlab-deployer" \
      --role contributor \
      --scopes /subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$AZURE_RESOURCE_GROUP

    return:
    {
      "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "displayName": "gitlab-deployer",
      "password": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "tenant": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }

    AZURE_CLIENT_ID: appId
    AZURE_CLIENT_SECRET: password
    AZURE_TENANT_ID: tenant

# Pipeline authentication

    az login \
      --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET \
      --tenant $AZURE_TENANT_ID
    az account set
      --subscription $AZURE_SUBSCRIPTION_ID

# deploy Angular (static web app)

    export AZURE_WEBAPP_NAME=iothub-sbx-front
    export AZURE_WEBAPP_DEPLOYMENT_TOKEN=750ddf7d********************c7c1450243c1968a1ab4dc71ca02-8b89b0dd-b9a6-4c81-afa5-af9688bb59040031107015c8ee03

    cd src/angular
    npm ci
    ng build --configuration production
    npm ci --omit=dev

    npm install -g @azure/static-web-apps-cli

    swa deploy dist/angular/browser \
      --app-name "$AZURE_WEBAPP_NAME" \
      --resource-group "$AZURE_RESOURCE_GROUP" \
      --env "production" \
      --deployment-token "$AZURE_WEBAPP_DEPLOYMENT_TOKEN"

# deploy Angular (storage account static website)

    export AZURE_STORAGE_ACCOUNT=iothubsbxstorage

    cd src/angular
    npm ci
    ng build --configuration production
    npm ci --omit=dev

    az storage blob upload-batch \
      --account-name $AZURE_STORAGE_ACCOUNT \
      --destination '$web' \
      --source dist/angular/browser \
      --overwrite \
      --only-show-errors

# Deploy App Service

    export AZURE_APP_SERVICE_NAME=iothub-sbx-api

    cd src/api
    npm ci
    npm run build
    npm ci --omit=dev
    rm $AZURE_APP_SERVICE_NAME.zip
    zip -r $AZURE_APP_SERVICE_NAME.zip .

    az webapp deploy \
        --name $AZURE_APP_SERVICE_NAME \
        --resource-group $AZURE_RESOURCE_GROUP \
        --src-path $AZURE_APP_SERVICE_NAME.zip \
        --type zip

# Deploy App Function

    export AZURE_FUNCTIONAPP_NAME=iothub-sbx-test

    cd src/functions
    npm ci
    rm -rf dist
    npm run build:prod
    npm ci --omit=dev
    rm $AZURE_FUNCTIONAPP_NAME.zip
    zip -r $AZURE_FUNCTIONAPP_NAME.zip .

    az functionapp deployment source config-zip \
      --name $AZURE_FUNCTIONAPP_NAME \
      --resource-group $AZURE_RESOURCE_GROUP \
      --src $AZURE_FUNCTIONAPP_NAME.zip
