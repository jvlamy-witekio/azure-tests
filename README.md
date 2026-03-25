# azure-tests

# install azure function core tools

npm install -g azure-functions-core-tools

# install azurite

npm install -g azurite

# install event-hubs simulator

https://learn.microsoft.com/en-gb/azure/event-hubs/overview-emulator

## init app function

func init . --worker-runtime node --language typescript
func new

## run locally

F5

## publish

func azure functionapp publish iothub-sbx-test

## (test) Azure Developer CLI

### Install azd

curl -fsSL https://aka.ms/install-azd.sh | bash

### Update azd

curl -fsSL https://aka.ms/install-azd.sh | bash

### Uninstall azd

curl -fsSL https://aka.ms/uninstall-azd.sh | bash
