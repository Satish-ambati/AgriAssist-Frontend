import torch.nn as nn
from torchvision import models
from torchvision.models import ResNet18_Weights

class PlantDiseaseNet(nn.Module):
    def __init__(self, num_classes):
        super(PlantDiseaseNet, self).__init__()
        # Use weights=None instead of deprecated pretrained=False
        self.base = models.resnet18(weights=None)
        self.base.fc = nn.Linear(self.base.fc.in_features, num_classes)

    def forward(self, x):
        return self.base(x)
